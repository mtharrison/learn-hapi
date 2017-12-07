module.exports = function (text) {

    const date = new Date(text);

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};