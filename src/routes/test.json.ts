export async function post(req, res, next) {
    console.log("test called");
    req.session.slUser = {
        uid: "test",
        email: "test@example.com",
        name: "test user",
        picture: "",
        identities: [],
        username: "test",
        github: ''
    };
    res.end(JSON.stringify({success:true}));
};

