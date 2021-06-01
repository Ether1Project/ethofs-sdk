module.exports = function testAuthentication(client) {
    //  test authentication to make sure that the user's provided keys are legit
    return new Promise((resolve, reject) => {
        client.accountExists()
            .then((exists) => {
                if (exists) resolve({ authenticated: true });
                else reject(new Error('ethoFS User Not Found'));
            })
            .catch(reject);
    });
};
