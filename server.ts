import express, { Request, Response } from "express";
import mysql from "mysql2/promise";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';



const app = express();
const port = 3000;
var total_amount = 0.00;
var instituicoes_donations = new Map<number, number>();
var users_donations = new Map<number, number>();

var instituicoes = new Map<number, Profile>();
var users: Profile[] = [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let connection: mysql.Connection;
app.use(express.static("public"));

app.use(express.json()); // ✅ Must be at the top
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // where your .ejs files are


class Session {
    ip: any;
    account: Account;
    constructor(ip: any, account: Account) {
        this.ip = ip;
        this.account = account;
    }
}

class Account {
    id: number;
    username: String;
    tipo: ProfileType;
    id_outro: number;
    constructor(id: any, username: String, tipo: ProfileType, chave: any) {
        this.id = id;
        this.id_outro = chave;
        this.tipo = tipo;
        this.username = username;
    }
}

enum ProfileType {
    user,
    instituition,
    admin,
}
class Profile {
    id: number | null;
    name: String;
    description: String;
    picture: String;
    type: ProfileType;
    link: String;
    email: String;
    value: number = 0.00;
    constructor(id: number | null, name: String, description: String, picture: String, type: ProfileType, link: String, email: String) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.picture = picture;
        this.type = type;
        this.link = link;
        this.email = email;
    }
}




var sessions: Map<string, Session> = new Map();

// Start the server
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});

async function get_profile_user(res: Response, id: number): Promise<Profile | null> {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE id = ?", [
        id
    ]);
    const user = rows[0];
    console.log(id);
    console.debug(user);
    const [rows2]: any = await connection.query("SELECT * FROM profile WHERE id = ?", [
        user.profile_id
    ]);
    const perfil = rows2[0];
    console.log("aaaaa");
    console.debug(perfil);
    const profile = new Profile(user.id, user.name, perfil.description, perfil.picture, ProfileType.instituition, "", perfil.email_publico);
    return profile;


}
async function get_profile_institution(res: Response, id: String): Promise<Profile | null> {
    const rows: any = await connection.query("SELECT * FROM instituicoes WHERE id = ?", [
        id
    ]);
    if (rows.length == 0) {
        res.status(404);
        res.send("couldnt find instituitions");
        return null
    }
    const institution = rows[0][0];
    const rows2: any = await connection.query("SELECT * FROM profile WHERE id = ?", [
        institution.profile_id
    ]);
    console.debug(rows2[0]);
    if (rows2.length == 0) {
        res.status(404);
        res.send("couldnt find instituitions");
        return null
    }
    const perfil = rows2[0][0];
    const profile = new Profile(institution.id, institution.name, perfil.description, perfil.picture, ProfileType.instituition, institution.link, perfil.email_publico);

    return profile;
}

app.get('/perfis/usuarios/:id', async (req: Request, res: Response): Promise<any> => {
    const profile = await get_profile_user(res, req.params.id);
    res.render("perfil_usuario", { profile });

});

app.get('/perfis/instituicoes/:id', async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;
    const profile = get_profile_institution(res, id);

    // res.render("perfil");
    res.render("perfil", { profile });
    return
});
app.get('/impacto', async (req: Request, res: Response): Promise<any> => {
    await render(req, res, "impacto", { users, instituicoes, total_amount })
});

app.get('/doacao', async (req: Request, res: Response): Promise<any> => {
    await render(req, res, "doacao", { users, instituicoes, total_amount })
});
app.get('/', async (req: Request, res: Response): Promise<any> => {
    await render(req, res, "index", { users, instituicoes, total_amount })
    return
});

app.get('/index-content', async (req: Request, res: Response): Promise<any> => {
    await render(req, res, "index-content", {})
    return
});
app.get('/top-nav', async (req: Request, res: Response): Promise<any> => {
    render(req, res, "top-nav", {});
    return
});

app.post("/api/register_donation", async (req: Request, res: Response): Promise<any> => {
    console.log("fazendo pagamento", req.body.valor);
    const [result] = await connection.execute("INSERT INTO doacoes(anonymous, instituicao_id, valor) VALUES(?,?,?)", [
        1, req.body.instituicao, req.body.valor
    ]);
    console.debug(result);
    console.debug(users);
});

app.post('/api/register_donation', async (req: Request, res: Response): Promise<any> => {
    if (req.body.instituicao == undefined || req.body.valor == undefined) {
        return res.status(400).send('Error: "name and isntituicao" is required');
    }
    var user = req.body.user_id ?? null;
    const sql = `INSERT INTO doacoes(user_id, instituicao, valor) VALUES (?,?,?)`;
    const values = [user, req.body.instituicao, req.body.valor];
    try {
        const [rows]: any = await connection.execute(sql, values);
        console.log(rows.insertId);
        return res.send(rows.insertId);
    } catch (err) {
        console.error("Error occurred:", err);
        return res.status(403).send(err);
    }
});

async function fill_institutions() {
    const rows: any = await connection.query("SELECT * FROM instituicoes", []);
    for (const institution of rows[0]) {
        const rows: any = await connection.query("SELECT * FROM profile WHERE id =?", [
            institution.profile_id
        ]);
        var perfil = rows[0][0];
        const profile = new Profile(institution.id, institution.name, perfil.description, perfil.picture, ProfileType.instituition, institution.link, perfil.email_publico);

        instituicoes.set(institution.id, profile);
    }
    // console.debug(instituicoes);


}

function add_anon(users: any, doacao: any) {
    const profile = new Profile(null, "Anonymous", doacao.message, "/default.png", ProfileType.user, "", "");
    profile.value += doacao.valor;
    users.push(profile);
}

async function add_user(users: any, doacao: any, id: number) {
    const rows: any = await connection.query("SELECT * FROM users where id=?", [id]);
    var user = rows[0][0];
    // console.debug(user);
    if (!user.show_donations) {
        add_anon(users, doacao);
        return
    };
    const rows2: any = await connection.query("SELECT * FROM profile WHERE id =?", [
        user.profile_id
    ]);
    var perfil = rows2[0][0];
    const profile = new Profile(user.id, user.name, doacao.message, perfil.picture, ProfileType.user, "", perfil.email_publico);
    profile.value += doacao.valor;
    users.push(profile);

}

function has_id(users: any, id: number): boolean {
    for (const user of users) {
        if (user.id == null) {
            continue;
        }
        if (user.id == id) {
            return true;
        }
    }
    return false
}

function get_user(users: Profile[], id: number): Profile {
    var i = 0;
    for (const user of users) {
        if (user.id == null) {
            i += 1;
            continue;
        }
        if (user.id == id) {
            return user;
        }
        i += 1;
    }
    throw new Error("Something went wrong!");

}

async function calculate_total() {
    const rows: any = await connection.query("SELECT * FROM doacoes", []);
    var instituicoes_temp = new Map<number, number>();
    var users_temp: Profile[] = [];
    var new_total = 0.00;
    for (const row of rows[0]) {
        new_total += row.valor;
        const instituicao_id = row.instituicao_id;
        const user_id = row.user_id;
        var value = 0.00;
        if (instituicoes_temp.has(instituicao_id)) {
            var value = instituicoes_temp.get(instituicao_id)!;
        }
        instituicoes_temp.set(instituicao_id, value + row.valor);
        if (row.anonymous == 1) {
            add_anon(users_temp, row);
            continue

        }
        if (!has_id(users_temp, user_id)) {
            await add_user(users_temp, row, user_id);
            continue
        }
        var profile = get_user(users_temp, user_id);
        profile.value += row.valor;
    }
    total_amount = new_total;
    instituicoes_temp.forEach((i, key) => {
        var profile = instituicoes.get(key)!;
        profile.value = i;

    });
    users = users_temp;
}


async function render(req: Request, res: Response, page_name: string, variables: any) {
    const session_num = req.cookies.session; // Replace 'cookieName' with the actual cookie name
    variables.profile = undefined;
    variables.account = undefined;
    if (session_num == undefined) {
        res.render(page_name, variables);
        return
    }
    const session = sessions.get(session_num);
    if (session) {
        variables.account = session.account;
        console.debug(session.account);
        var profile = await get_profile_user(res, session.account.id_outro);
        variables.profile = profile;
        console.debug(variables);
        res.render(page_name, variables);
        return
    }
    console.log("no session stored with:", session_num);
    res.clearCookie("session");
    res.render(page_name, variables);
    return

}

async function list_accounts() {
    const [rows]: any = await connection.query("SELECT * FROM account ");
    console.debug(rows);

}

async function new_cookie(req: Request, res: Response, account: Account) {
    let token = crypto.randomBytes(16).toString("hex");
    var session = new Session(req.ip, account);
    res.cookie("session", token, {
        httpOnly: true,
        secure: true,
        // maxAge: 60 * 10000,
        maxAge: 60 * 1000,
        sameSite: "strict",
        path: "/",
    });
    setTimeout(() => {
        sessions.delete(token);
    }, 60 * 1000);

    sessions.set(token, session);
    console.log("cookie sent!");
}

app.post("/api/sign_in", async (req: Request, res: Response): Promise<any> => {
    console.debug(req.body);
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    console.log("aaa");
    const sql = `
    INSERT INTO profile(description, picture, email_publico) VALUES("","/default.png","${email}");
    INSERT INTO users (name, tipo, profile_id) VALUES ("${username}", 1, LAST_INSERT_ID());
    INSERT INTO account (username, email, password, tipo, id_outro ) VALUES ("${username}", "${email}", "${password}", 1, LAST_INSERT_ID());
  `;
    const [results]: any = await connection.query(sql);
    console.debug(results);
    let account = new Account(results[2].insertId, username, ProfileType.user, results[1].insertId);
    new_cookie(req, res, account)
    res.status(200).send('OK');
});

app.post("/api/login_form", async (req: Request, res: Response): Promise<any> => {
    console.debug(req.body);
    list_accounts();

    let email = req.body.email;
    let password = req.body.password;
    const [rows]: any = await connection.query("SELECT * FROM account WHERE email = ?", [
        email,
    ]);
    if (rows.length == 0) {
        res.status(404);
        return res.send("couldnt find email");
    }
    let user = rows[0];
    if (user.password != password) {
        res.status(401);
        return res.send("wrong password");
    }
    new_cookie(req, res, user);
    res.status(200).send('OK');
});

// MySQL connection setup
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "senha",
    database: "RuaSolidaria",
    port: 3308,
    multipleStatements: true,
};

// Connect to MySQL when server starts
async function connectToDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to MySQL database!");
    } catch (err) {
        console.error("Database connection failed:", err);
    }
}
function timeout(time: number) {
    const timer: NodeJS.Timeout = setTimeout(() => {
        // fill_institutions();
        calculate_total();
        timeout(500);
    }, time);
}
connectToDB().then(() => {
    fill_institutions().then(() => {
        calculate_total().then(() => { })
    });
    timeout(500);
});

