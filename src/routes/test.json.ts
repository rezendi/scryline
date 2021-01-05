export async function post(req, res, next) {
    console.log("test called");
    res.end(JSON.stringify({success:true}));
};

