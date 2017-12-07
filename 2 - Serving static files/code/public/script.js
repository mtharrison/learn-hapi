var request = new XMLHttpRequest();
request.open('GET', 'https://icanhazdadjoke.com/', true);
request.setRequestHeader('accept', 'application/json');

request.onload = function() {
    
    var data = JSON.parse(request.responseText);
    const { joke } = data;

    document.querySelector('.joke').textContent = joke;
};

request.send();