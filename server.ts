import express, { Request, Response } from "express";
import mysql from "mysql2/promise";
import crypto from "crypto";
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';
import multer from 'multer';




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
const upload = multer({ dest: 'public/images' });


class Session {
    ip: any;
    account: Account;
    constructor(ip: any, account: Account) {
        this.ip = ip;
        this.account = account;
    }
}

enum UserType {
    normal,
    admin
}



class User {
    id: number;
    name: String;
    show_donations: boolean;
    tipo: UserType;
    profile_id: number;

    constructor(id: number, name: String, show_donations: boolean, tipo: UserType, profile_id: number) {
        this.id = id;
        this.name = name;
        this.show_donations = show_donations;
        this.tipo = tipo;
        this.profile_id = profile_id;
    }
}
async function get_user_dao(id: number): Promise<User | null> {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE id = ?", [
        id
    ]);
    const user = rows[0];
    if (user.length == 0) {
        return null;
    }
    return new User(user.id, user.name, user.show_donations, user.tipo, user.profile_id);

}


class Donation {
    id: number;
    user_id: number | null;
    anonymous: boolean;
    instituicao_id: number;
    valor: number;
    constructor(id: number, user_id: number | null, anonymous: boolean, instituicao_id: number, valor: number) {
        this.id = id;
        this.user_id = user_id;
        this.anonymous = anonymous;
        this.instituicao_id = instituicao_id;
        this.valor = valor;
    }


}
async function get_donation(id: number): Promise<Donation | null> {
    const [rows]: any = await connection.query("SELECT * FROM donations WHERE id = ?", [
        id
    ]);
    const donation = rows[0];
    if (donation.length == 0) {
        return null;
    }
    return new Donation(donation.id, donation.user_id, donation.anonymoys, donation.instituicao_id, donation.valor);

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
    user_id: number | null;
    id: number | null;
    name: String;
    description: String;
    picture: String;
    type: ProfileType;
    link: String;
    email: String;
    value: number = 0.00;
    message: String;
    constructor(user_id: number | null, id: number | null, name: String, description: String, picture: String, type: ProfileType, link: String, email: String, message = "") {
        this.user_id = user_id;
        this.id = id;
        this.name = name;
        this.description = description;
        this.picture = picture;
        this.type = type;
        this.link = link;
        this.email = email;
        this.message = message;
    }
}




var sessions: Map<string, Session> = new Map();

// Start the server
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});

async function get_profile_dao(id: number): Promise<Profile | null> {
    const [rows]: any = await connection.query("SELECT * FROM profile WHERE id = ?", [
        id
    ]);
    const perfil = rows[0];
    return perfil;

}
async function get_profile_user(res: Response, id: number): Promise<Profile | null> {
    const [rows]: any = await connection.query("SELECT * FROM users WHERE id = ?", [
        id
    ]);
    const user = rows[0];
    console.log(id);
    const [rows2]: any = await connection.query("SELECT * FROM profile WHERE id = ?", [
        user.profile_id
    ]);
    const perfil = rows2[0];
    const profile = new Profile(user.id, perfil.id, user.name, perfil.description, perfil.picture, ProfileType.user, "", perfil.email_publico);

    return profile;


}
async function get_profile_institution(res: Response, id: String): Promise<Profile | null> {

    const [rows]: any = await connection.query("SELECT * FROM instituicoes WHERE id = ?", [
        id
    ]);
    if (rows.length == 0) {
        res.status(404);
        res.send("couldnt find instituitions");
        return null
    }
    const institution = rows[0];
    const [rows2]: any = await connection.query("SELECT * FROM profile WHERE id = ?", [
        institution.profile_id
    ]);
    if (rows2.length == 0) {
        res.status(404);
        res.send("couldnt find instituitions");
        return null
    }
    const perfil = rows2[0];
    const profile = new Profile(null, institution.id, institution.name, perfil.description, perfil.picture, ProfileType.instituition, institution.link, perfil.email_publico);

    return profile;
}

app.post('/api/save_profile', async (req: Request, res: Response): Promise<any> => {
    const cookie: any = req.cookies.session;
    if (cookie == undefined) return;
    let session = sessions.get(cookie);
    if (session == undefined) {
        return;
    }
    let user = await get_user_dao(session!.account.id_outro);
    console.debug(user);
    if (user == undefined) return;
    let name: any = req.body.name;
    let description = req.body.description;
    console.debug(req.body);
    if (description == undefined && name == undefined) {
        res.status(500).send("error");
        return
    }
    if (description) {
        await connection.execute("UPDATE profile SET description=?  WHERE id=?", [
            description, user!.profile_id]);
    }
    if (name) {
        await connection.execute("UPDATE users SET name=? WHERE id=?", [
            name, user!.id]);
    }
    res.status(200).send("ok");
    return
});
app.post('/api/upload/:id', upload.single('image'), async (req: Request, res: Response): Promise<any> => {
    const cookie: any = req.cookies.session;
    if (cookie == undefined) return;
    const id: number = parseInt(req.params.id);


    log("nova imagem feita o upload:" + req.file?.filename);
    const [result] = await connection.execute("UPDATE profile SET picture=? WHERE id=?", [
        "/" + req.file.filename, id]);
    res.status(200).send("ok");


});
app.get('/perfis/usuarios/:id', async (req: Request, res: Response): Promise<any> => {
    // const profile = await get_profile_user(res, req.params.id);
    // if (profile == null) {
    //     console.error("couldnt find proifile");
    // }
    const profile = get_user(users, parseInt(req.params.id));
    console.debug(profile);
    res.render("perfil_usuario", { profile });

});

app.get('/perfis/instituicoes/:id', async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;
    const profile = await get_profile_institution(res, id);

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
    await render(req, res, "top-nav", {});
    return
});
app.get('/admins', async (req: Request, res: Response): Promise<any> => {
    // await render(req, res, "ad", {});
    var logs = await get_logs();
    render(req, res, "admins", { logs })
    return
});

app.post("/api/register_donation", async (req: Request, res: Response): Promise<any> => {
    const session_num = req.cookies.session; // Replace 'cookieName' with the actual cookie name
    if (session_num) {
        const session = sessions.get(session_num);
        const user = await get_user_dao(session!.account.id_outro);
        console.log("vou fazer doacao:");
        if (user) {
            const [result] = await connection.execute("INSERT INTO doacoes(user_id, instituicao_id, valor, message) VALUES(?,?,?,?)", [
                user!.id, req.body.instituicao, req.body.valor, req.body.message]);
            res.status(200).send("Ok");
            log("doação feita por: " + user!.name);
            return
        }
    }
    const [result] = await connection.execute("INSERT INTO doacoes(anonymous, instituicao_id, valor, message) VALUES(?,?,?,?)", [
        1, req.body.instituicao, req.body.valor, req.body.message]);
    res.status(200).send("Ok");
    log("doação feita por anonymous: ");
});


async function get_logs(): Promise<any> {
    const [result]: any = await connection.query("SELECT * FROM logs", []);
    return result
}

async function log(message: String) {
    await connection.execute("INSERT INTO logs( message) VALUES(?)", [message]);
}

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
        const profile = new Profile(null, institution.id, institution.name, perfil.description, perfil.picture, ProfileType.instituition, institution.link, perfil.email_publico);

        instituicoes.set(institution.id, profile);
    }


}

function add_anon(users: any, doacao: any) {
    const profile = new Profile(null, null, "Anonymous", "", "/default.png", ProfileType.user, "", "", doacao.message);
    profile.value += doacao.valor;
    users.push(profile);
}

async function add_user(users: any, doacao: any, id: number) {
    const rows: any = await connection.query("SELECT * FROM users where id=?", [id]);
    var user = rows[0][0];
    if (!user.show_donations) {
        add_anon(users, doacao);
        return
    };
    const rows2: any = await connection.query("SELECT * FROM profile WHERE id =?", [
        user.profile_id
    ]);
    var perfil = rows2[0][0];
    const profile = new Profile(user.id, perfil.id, user.name, perfil.description, perfil.picture, ProfileType.user, "", perfil.email_publico, doacao.message);
    profile.value += doacao.valor;
    users.push(profile);

}

function has_id(profiles: any, id: number): boolean {
    for (const profile of profiles) {
        if (profile.user_id == null) {
            continue;
        }
        if (profile.user_id == id) {
            return true;
        }
    }
    return false
}

function get_user(profiles: Profile[], id: number): Profile {
    var i = 0;
    for (const profile of profiles) {
        if (profile.user_id == null) {
            i += 1;
            continue;
        }
        if (profile.user_id == id) {
            return profile;
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
        profile.message = row.message;
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
        var profile = await get_profile_user(res, session.account.id_outro);
        variables.profile = profile;
        res.render(page_name, variables);
        return
    }
    res.clearCookie("session");
    res.render(page_name, variables);
    return

}

async function list_accounts() {
    const [rows]: any = await connection.query("SELECT * FROM account ");

}

async function new_cookie(req: Request, res: Response, account: Account) {
    let token = crypto.randomBytes(16).toString("hex");
    var session = new Session(req.ip, account);
    log("new cookie created to user: " + session.account.username);
    res.cookie("session", token, {
        httpOnly: true,
        secure: true,
        // maxAge: 60 * 10000,
        maxAge: 60 * 10000,
        sameSite: "strict",
        path: "/",
    });
    setTimeout(() => {
        sessions.delete(token);
    }, 60 * 10000);

    sessions.set(token, session);
}

app.post("/api/logout", async (req: Request, res: Response): Promise<any> => {
    let cookie = req.cookies.session;
    res.clearCookie('session');
    if (cookie == undefined) {
        res.status(200).send("Ok");
        return
    }
    sessions.delete(cookie);
    res.status(200).send("Ok");
});

app.post("/api/sign_in", async (req: Request, res: Response): Promise<any> => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    const sql = `
    INSERT INTO profile(description, picture, email_publico) VALUES("","/default.png","${email}");
    INSERT INTO users (name, tipo, profile_id) VALUES ("${username}", 1, LAST_INSERT_ID());
    INSERT INTO account (username, email, password, tipo, id_outro ) VALUES ("${username}", "${email}", "${password}", 1, LAST_INSERT_ID());
  `;
    const [results]: any = await connection.query(sql);
    let account = new Account(results[2].insertId, username, ProfileType.user, results[1].insertId);
    new_cookie(req, res, account)
    res.status(200).send('OK');
});

app.post("/api/login_form", async (req: Request, res: Response): Promise<any> => {
    list_accounts();
    let username = req.body.username;
    let account = undefined;
    if (username.includes('@')) {
        const [rows]: any = await connection.query("SELECT * FROM account WHERE email = ?", [
            username,
        ]);
        account = rows[0];
    }
    else {
        const [rows]: any = await connection.query("SELECT * FROM account WHERE username = ?", [
            username,
        ]);
        account = rows[0];
    }
    let password = req.body.password;
    if (account.password != password) return res.status(401).send("wrong password");
    new_cookie(req, res, account);
    res.status(200).send('ok');
});

// MySQL connection setup
const dbConfig = {
    host: "sql-rua-solidaria3.internal",
    // host: "localhost",
    user: "root",
    // password: "senha",
    password: "senhasenhasenhasenha",
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
        fill_institutions();
        calculate_total();
        timeout(time);
    }, time);
}
connectToDB().then(() => {
    fill_institutions().then(() => {
        log("server started at port 3308");
        calculate_total().then(() => { })
    });
    timeout(500);
});

