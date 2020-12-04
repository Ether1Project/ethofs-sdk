import testAuthentication from'../../../src/commands/data/testAuthentication';

test('Result of ethoFS user not found', () => {
    return expect(testAuthentication('000000000000000000000000000000000000000000000000000000000000000a')).rejects.toEqual(Error('ethoFS User Not Found'));
});
/*
test('200 status is returned', () => {
    const goodStatus = {
        status: 200
    };
    axios.get.mockResolvedValue(goodStatus);
    expect.assertions(1);
    return expect(testAuthentication('test', 'test')).resolves.toEqual({
        authenticated: true
    });
});

test('Rejection handled', () => {
    axios.get.mockRejectedValue('test error');
    expect.assertions(1);
    return expect(testAuthentication('test', 'test')).rejects.toEqual('test error');
});
*/
