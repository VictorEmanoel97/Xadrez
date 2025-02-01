// Quadrados válidos para movimento
let quadradosLegais = [];
// Variável de turno
let turnobranco = true;
const tabuleiro = document.querySelectorAll(".quadrado");
// Seleciona todas as peças com classe peça
const pecas = document.querySelectorAll(".peça");
// Seleciona todas as imagens dentro das peças
const pecasImagens = document.querySelectorAll("img");

// Configura o tabuleiro e as peças ao carregar o script
setupTabuleiro();
setupPecas();

// Função para configurar tabuleiro
function setupTabuleiro() {
  let i = 0;
  for (let quadrado of tabuleiro) {
    quadrado.addEventListener("dragover", (e) => {
      e.preventDefault(); 
    });
    quadrado.addEventListener("drop", drop);
    
    let row = 8 - Math.floor(i / 8);
    let column = String.fromCharCode(97 + (i % 8));
    quadrado.id = column + row; // Define o ID do quadrado
    i++;
  }
}

// Configurar peças
function setupPecas() {
  for (let peca of pecas) {
    peca.addEventListener("dragstart", drag);
    if (peca) {
      peca.setAttribute("draggable", true);
      peca.id = peca.classList[1] + peca.parentElement.id;
    }
  }

  for (let pecaImagem of pecasImagens) {
    pecaImagem.setAttribute("draggable", false);
  }
}

// Função chamada ao arrastar uma peça
function drag(e) {
  const peca = e.target;
  const pecaCor = peca.getAttribute("color") || ""; 
  if ((turnobranco && pecaCor === "branco") || (!turnobranco && pecaCor === "preto")) {
    e.dataTransfer.setData("text", peca.id);
    const quadradoInicialId = peca.parentNode.id;
    getPossiveisMov(quadradoInicialId, peca);
  }
}

// Função chamada ao dropar uma peça
function drop(e) {
  e.preventDefault();
  let data = e.dataTransfer.getData("text");
  const peca = document.getElementById(data);
  const destinoQuadrado = e.currentTarget;
  const pecaNoDestino = destinoQuadrado.querySelector(".peça");
  
  if (quadradosLegais.includes(destinoQuadrado.id)) {
    if (!pecaNoDestino) {
      destinoQuadrado.appendChild(peca);
      turnobranco = !turnobranco;
    } else if (pecaNoDestino.getAttribute("color") !== peca.getAttribute("color")) {
      pecaNoDestino.remove();
      destinoQuadrado.appendChild(peca);
      turnobranco = !turnobranco;
    }
  }
}

// Função para obter movimentos válidos
function getPossiveisMov(posicao, peca) {
  quadradosLegais = [];
  const tipoPeca = peca.classList[1];
  const coluna = posicao[0];
  const linha = parseInt(posicao[1]);

  switch (true) {
    case tipoPeca.includes("peao"):
      movimentosPeao(coluna, linha, peca);
      break;
    case tipoPeca.includes("torre"):
      movimentosTorre(coluna, linha);
      break;
    case tipoPeca.includes("bispo"):
      movimentosBispo(coluna, linha);
      break;
    case tipoPeca.includes("cavalo"):
      movimentosCavalo(coluna, linha);
      break;
    case tipoPeca.includes("rainha"):
      movimentosRainha(coluna, linha);
      break;
    case tipoPeca.includes("rei"):
      movimentosRei(coluna, linha);
      break;
  }
}

// Funções para movimentação das peças
function movimentosPeao(coluna, linha, peca) {
  const direcao = peca.getAttribute("color") === "branco" ? 1 : -1;
  const novaLinha = linha + direcao;
  const linhaInicial = peca.getAttribute("color") === "branco" ? 2 : 7;
  
  // Verifica se a casa à frente está livre
  let quadradoFrente = document.getElementById(coluna + novaLinha);
  if (quadradoFrente && !quadradoFrente.querySelector(".peça")) {
    quadradosLegais.push(coluna + novaLinha);

    // Se o peão estiver na posição inicial, pode avançar duas casas
    const duasCasas = linha + 2 * direcao;
    let quadradoDuasCasas = document.getElementById(coluna + duasCasas);
    if (linha === linhaInicial && quadradoDuasCasas && !quadradoDuasCasas.querySelector(".peça")) {
      quadradosLegais.push(coluna + duasCasas);
    }
  }

  // Capturas diagonais
  const colunasLaterais = [
    String.fromCharCode(coluna.charCodeAt(0) - 1),
    String.fromCharCode(coluna.charCodeAt(0) + 1)
  ];
  
  for (let novaColuna of colunasLaterais) {
    if (novaColuna >= 'a' && novaColuna <= 'h') {
      let quadradoDiagonal = document.getElementById(novaColuna + novaLinha);
      if (quadradoDiagonal) {
        let pecaNoDestino = quadradoDiagonal.querySelector(".peça");
        if (pecaNoDestino && pecaNoDestino.getAttribute("color") !== peca.getAttribute("color")) {
          quadradosLegais.push(novaColuna + novaLinha);
        }
      }
    }
  }
}

function movimentosTorre(coluna, linha) {
  for (let i = 1; i <= 8; i++) {
    if (i !== linha) quadradosLegais.push(coluna + i);
  }
  for (let i = 97; i <= 104; i++) {
    let novaColuna = String.fromCharCode(i);
    if (novaColuna !== coluna) quadradosLegais.push(novaColuna + linha);
  }
}

function movimentosBispo(coluna, linha) {
  for (let i = 1; i <= 8; i++) {
    if (i !== linha) {
      let deslocamento = i - linha;
      let novaColuna1 = String.fromCharCode(coluna.charCodeAt(0) + deslocamento);
      let novaColuna2 = String.fromCharCode(coluna.charCodeAt(0) - deslocamento);

      if (novaColuna1 >= 'a' && novaColuna1 <= 'h') quadradosLegais.push(novaColuna1 + i);
      if (novaColuna2 >= 'a' && novaColuna2 <= 'h') quadradosLegais.push(novaColuna2 + i);
    }
  }
}

function movimentosCavalo(coluna, linha) {
  const movimentos = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];
  for (let [dx, dy] of movimentos) {
    let novaColuna = String.fromCharCode(coluna.charCodeAt(0) + dx);
    let novaLinha = linha + dy;
    if (novaColuna >= 'a' && novaColuna <= 'h' && novaLinha >= 1 && novaLinha <= 8) {
      quadradosLegais.push(novaColuna + novaLinha);
    }
  }
}

function movimentosRainha(coluna, linha) {
  movimentosTorre(coluna, linha);
  movimentosBispo(coluna, linha);
}

function movimentosRei(coluna, linha) {
  const movimentos = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, -1], [1, -1], [-1, 1]
  ];
  for (let [dx, dy] of movimentos) {
    let novaColuna = String.fromCharCode(coluna.charCodeAt(0) + dx);
    let novaLinha = linha + dy;
    if (novaColuna >= 'a' && novaColuna <= 'h' && novaLinha >= 1 && novaLinha <= 8) {
      quadradosLegais.push(novaColuna + novaLinha);
    }
  }
}

