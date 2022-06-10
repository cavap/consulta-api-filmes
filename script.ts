interface resultLista {
  page?: number,
  results?: Array<any>,
  totalPages?: number,
  totalResults?: number,
  request_token?: string,
  session_id?: string,
}

interface body {
  username: string,
  password: string,
  request_token?: string,
}

interface requisicao {
  url: string,
  method: string,
  body?: body | string | null
}





let apiKey: string;
let requestToken: string | undefined;
let username: string;
let password: string;
let sessionId: string | undefined;

let loginButton: HTMLButtonElement | null = <HTMLButtonElement> document.getElementById('login-button');
let searchButton: HTMLButtonElement | null = <HTMLButtonElement> document.getElementById('search-button');
let searchContainer: HTMLElement | null = <HTMLElement> document.getElementById('search-container');

loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
  console.log('done')
})

searchButton.addEventListener('click', async () => {
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let searchElement: HTMLInputElement | null = <HTMLInputElement> document.getElementById('search');
  let query: string = searchElement.value;
  let listaDeFilmes: resultLista | null = await procurarFilme(query);
  let ul = document.createElement('ul');
  ul.id = "lista"
  if(listaDeFilmes.results){
    for (const item of listaDeFilmes.results) {
      let li = document.createElement('li');
      li.appendChild(document.createTextNode(item.original_title))
      ul.appendChild(li)
    }
    console.log(listaDeFilmes);
    searchContainer?.appendChild(ul);
  }
})


class HttpClient {
  static async get({url, method, body = null}: requisicao): Promise<resultLista> {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query: string): Promise<resultLista> {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return <resultLista> result
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  })
  requestToken = result.request_token
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })
  sessionId = result.session_id;
}

function preencherSenha() {
  let passwordElement: HTMLInputElement | null = <HTMLInputElement> document.getElementById('senha');
  password = passwordElement.value;
  validateLoginButton();
}

function preencherLogin() {
  let loginElement: HTMLInputElement | null = <HTMLInputElement> document.getElementById('login');
  username =  loginElement.value;
  validateLoginButton();
}

function preencherApi() {
  let apiKeyElement: HTMLInputElement | null = <HTMLInputElement> document.getElementById('api-key');
  apiKey = apiKeyElement.value;
  validateLoginButton();
}

function validateLoginButton() {
  if(loginButton){
    if (password && username && apiKey) {
      loginButton.disabled = false;
    } else {
      loginButton.disabled = true;
    }
  }
}