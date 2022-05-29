async function getUsersFromDatabase(req, dbCollection, objectToFind) {
    try {
        let response = await req.app.locals.db
            .collection(dbCollection)
            .find(objectToFind)
            .toArray();

        return await response;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    getUsersFromDatabase
}