let posicaoReiBranco = "e1";
let posicaoReiPreto = "e8";
let quadradosLegais = [];
let turnobranco = true;
let pecaSelecionada = null;

const tabuleiro = document.querySelectorAll(".quadrado");
const pecas = document.querySelectorAll(".peça");

setupTabuleiro();
setupPecas();

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
      movimentosTorre(coluna, linha, peca);
      break;
    case tipoPeca.includes("bispo"):
      movimentosBispo(coluna, linha, peca);
      break;
    case tipoPeca.includes("cavalo"):
      movimentosCavalo(coluna, linha);
      break;
    case tipoPeca.includes("rainha"):
      movimentosRainha(coluna, linha, peca);
      break;
    case tipoPeca.includes("rei"):
      movimentosRei(coluna, linha);
      break;
  }
}

function movimentosGerais(coluna, linha, direcoes, peca) {
  for (let [dx, dy] of direcoes) {
    let novaColuna = coluna.charCodeAt(0);
    let novaLinha = linha;

    while (validarCoordenada(String.fromCharCode(novaColuna + dx), novaLinha + dy)) {
      novaColuna += dx;
      novaLinha += dy;

      let pos = String.fromCharCode(novaColuna) + novaLinha;
      let quadrado = document.getElementById(pos);
      if (!quadrado) break;

      let pecaNoDestino = quadrado.querySelector(".peça");

      if (pecaNoDestino) {
        if (pecaNoDestino.getAttribute("color") !== peca.getAttribute("color")) {
          quadradosLegais.push(pos);
        }
        break;
      }

      quadradosLegais.push(pos);
    }
  }
}

function atualizarCoordenadas(peca, posicao) {
  const coordenadasDiv = document.getElementById("coordenadasDiv");
  const nomePeca = peca.classList[1]; // pega o nome da peça
  const cor = peca.getAttribute("color"); // pega a cor da peça

  coordenadasDiv.textContent = `${nomePeca} (${cor}) - ${posicao}`; 
}

function atualizarPosicaoRei(peca, novaPosicao) {
  const cor = peca.getAttribute("color");
  if (peca.classList.contains("rei")) {
    if (cor === "branco") {
      posicaoReiBranco = novaPosicao;
    } else if (cor === "preto") {
      posicaoReiPreto = novaPosicao;
    }
  }
}

// Destacar quadrados
function destacarQuadrado(quadrado) {
  quadrado.classList.add('destacado'); // Adicionar uma classe CSS para destacar o quadrado
}

function limparDestaques() {
  tabuleiro.forEach(quadrado => quadrado.classList.remove('destacado'));
}

// Função para mover a peça
function moverPeca(e) {
  if (!pecaSelecionada) return;

  const destinoQuadrado = e.currentTarget;
  const pecaNoDestino = destinoQuadrado.querySelector(".peça");

  if (quadradosLegais.includes(destinoQuadrado.id)) {
    if (!pecaNoDestino) {
      destinoQuadrado.appendChild(pecaSelecionada);
    } else if (pecaNoDestino.getAttribute("color") !== pecaSelecionada.getAttribute("color")) {
      pecaNoDestino.remove();
      destinoQuadrado.appendChild(pecaSelecionada);
    }

    turnobranco = !turnobranco;
    atualizarCoordenadas(pecaSelecionada, destinoQuadrado.id);
    atualizarPosicaoRei(pecaSelecionada, destinoQuadrado.id); // Atualiza a posição do rei
    pecaSelecionada = null;
    limparDestaques();
  }
}

function processarPGN(pgnTexto) {
    let linhas = pgnTexto.split("\n");
    let movimentosTexto = [];

    for (let linha of linhas) {
        if (!linha.startsWith("[") && linha.trim() !== "") {
            movimentosTexto.push(linha);
        }
    }

    let movimentos = movimentosTexto.join(" ").replace(/\d+\./g, "").trim().split(/\s+/);
    
    for (let movimento of movimentos) {
        if (movimento === "1-0" || movimento === "0-1" || movimento === "1/2-1/2") {
            break; // Fim da partida
        }
        executarMovimentoPGN(movimento);
    }
}

function processarMovimento() {
  let input = document.getElementById("pgnInput").value.trim();
  
  if (!input) return;

  let movimento = parsePGN(input);
  if (movimento) {
    executarMovimento(movimento.origem, movimento.destino);
  } else {
    alert("Movimento inválido!");
  }
}

function parsePGN(pgn) {
  // Simples conversão de PGN para coordenadas
  let regex = /^([a-h][1-8])\s?[-x]\s?([a-h][1-8])$/;
  let match = pgn.match(regex);

  if (match) {
    return { origem: match[1], destino: match[2] };
  }
  return null;
}

function executarMovimento(origem, destino) {
  let peca = document.getElementById(origem).querySelector(".peça");

  if (peca) {
    let destinoQuadrado = document.getElementById(destino);
    let pecaNoDestino = destinoQuadrado.querySelector(".peça");

    if (pecaNoDestino) pecaNoDestino.remove();
    
    destinoQuadrado.appendChild(peca);
    turnobranco = !turnobranco; // Alternar turno
  } else {
    alert("Nenhuma peça encontrada na origem!");
  }
}

function executarMovimentoPGN(movimento) {
    // Tratar roque
    if (movimento === 'O-O') {
        executarMovimento(turnobranco ? 'e1' : 'e8', turnobranco ? 'g1' : 'g8');
        return;
    }
    if (movimento === 'O-O-O') {
        executarMovimento(turnobranco ? 'e1' : 'e8', turnobranco ? 'c1' : 'c8');
        return;
    }

    // Tratar promoção
    if (movimento.includes('=')) {
        const [destino, promocao] = movimento.split('=');
        executarMovimento(/*...*/);
        promoverPeao(promocao.toLowerCase(), destino);
        return;
    }

    // Tratar xeque (# e +)
    movimento = movimento.replace(/[+#]/, '');
    // Resto do código...
}
function encontrarPeaoQuePodeIr(destino) {
    let coluna = destino[0];
    let linha = parseInt(destino[1]);
    let direcao = turnobranco ? -1 : 1;
    let origem = coluna + (linha - direcao);
    return document.getElementById(origem) ? origem : null;
}

function encontrarPecaPorTipo(tipo, destino) {
  let possiveisPecas = document.querySelectorAll(`.peça.${tipo.toLowerCase()}[color="${turnobranco ? 'branco' : 'preto'}"]`);
  for (let peca of possiveisPecas) {
    let posicaoAtual = peca.parentElement.id;
    getPossiveisMov(posicaoAtual, peca);
    if (quadradosLegais.includes(destino)) {
      return posicaoAtual;
    }
  }
  return null;
}

// Adicione estas variáveis para rastrear o movimento das torres
let torresMovidas = {
    branco: { a1: false, h1: false },
    preto: { a8: false, h8: false }
};

// Modifique a função movimentosRei
function movimentosRei(coluna, linha) {
    const direcoes = [
        [0, 1], [1, 1], [1, 0], [1, -1],
        [0, -1], [-1, -1], [-1, 0], [-1, 1]
    ];

    // Movimentos normais
    direcoes.forEach(([dx, dy]) => {
        const novaCol = String.fromCharCode(coluna.charCodeAt(0) + dx);
        const novaLinha = linha + dy;
        if (validarCoordenada(novaCol, novaLinha)) {
            quadradosLegais.push(novaCol + novaLinha);
        }
    });

    // Roque
    const cor = pecaSelecionada.getAttribute("color");
    if (!pecaSelecionada.hasMoved) {
        // Roque pequeno
        if (!torresMovidas[cor][cor === 'branco' ? 'h1' : 'h8']) {
            const caminhoLivre = [cor === 'branco' ? 'f1' : 'f8', cor === 'branco' ? 'g1' : 'g8'];
            if (caminhoLivre.every(pos => !document.getElementById(pos).querySelector(".peça"))) {
                quadradosLegais.push(cor === 'branco' ? 'g1' : 'g8');
            }
        }
        // Roque grande
        if (!torresMovidas[cor][cor === 'branco' ? 'a1' : 'a8']) {
            const caminhoLivre = [cor === 'branco' ? 'd1' : 'd8', cor === 'branco' ? 'c1' : 'c8'];
            if (caminhoLivre.every(pos => !document.getElementById(pos).querySelector(".peça"))) {
                quadradosLegais.push(cor === 'branco' ? 'c1' : 'c8');
            }
        }
    }
}

// Na função moverPeca, adicione:
if (pecaSelecionada.classList.contains("rei")) {
    // Roque pequeno
    if (Math.abs(destinoQuadrado.id.charCodeAt(0) - coluna.charCodeAt(0)) === 2) {
        const torrePos = destinoQuadrado.id[0] === 'g' ? 'h' + destinoQuadrado.id[1] : 'a' + destinoQuadrado.id[1];
        const novaTorrePos = destinoQuadrado.id[0] === 'g' ? 'f' + destinoQuadrado.id[1] : 'd' + destinoQuadrado.id[1];
        const torre = document.getElementById(torrePos).querySelector(".peça");
        document.getElementById(novaTorrePos).appendChild(torre);
    }
    pecaSelecionada.hasMoved = true;
}

if (pecaSelecionada.classList.contains("torre")) {
    torresMovidas[pecaSelecionada.getAttribute("color")][pecaSelecionada.parentElement.id] = true;
}

function estaEmXeque(cor) {
    const reiPos = cor === 'branco' ? posicaoReiBranco : posicaoReiPreto;
    // Verificar todas as peças adversárias
    const adversario = cor === 'branco' ? 'preto' : 'branco';
    const pecasAdversarias = document.querySelectorAll(`.peça[color="${adversario}"]`);
    
    for (const peca of pecasAdversarias) {
        const posicao = peca.parentElement.id;
        getPossiveisMov(posicao, peca);
        if (quadradosLegais.includes(reiPos)) return true;
    }
    return false;
}

function verificarXequeMate(cor) {
    // Verificar todos os movimentos possíveis do jogador
    const pecasJogador = document.querySelectorAll(`.peça[color="${cor}"]`);
    
    for (const peca of pecasJogador) {
        const posicao = peca.parentElement.id;
        getPossiveisMov(posicao, peca);
        if (quadradosLegais.length > 0) return false;
    }
    return true;
}

// Na função moverPeca, após mover:
setTimeout(() => {
    if (estaEmXeque(turnobranco ? 'preto' : 'branco')) {
        if (verificarXequeMate(turnobranco ? 'preto' : 'branco')) {
            alert(turnobranco ? 'Xeque-mate! Brancas vencem!' : 'Xeque-mate! Pretas vencem!');
        } else {
            console.log(turnobranco ? 'Preto em xeque!' : 'Branco em xeque!');
        }
    }
}, 100);

function mostrarPromocao(posicao) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.backgroundColor = 'white';
    modal.innerHTML = `
        <div>Escolha a promoção:</div>
        <button onclick="promoverPeao('rainha', '${posicao}')">Rainha</button>
        <button onclick="promoverPeao('torre', '${posicao}')">Torre</button>
        <button onclick="promoverPeao('bispo', '${posicao}')">Bispo</button>
        <button onclick="promoverPeao('cavalo', '${posicao}')">Cavalo</button>
    `;
    document.body.appendChild(modal);
}

function promoverPeao(tipo, posicao) {
    const peao = document.getElementById(posicao).querySelector(".peça");
    peao.className = `peça ${tipo} ${peao.getAttribute("color")}`;
    document.body.removeChild(document.querySelector('div[style*="fixed"]'));
}

// Na função moverPeca, antes de terminar:
if (pecaSelecionada.classList.contains("peao")) {
    const linhaDestino = destinoQuadrado.id[1];
    const cor = pecaSelecionada.getAttribute("color");
    if ((cor === 'branco' && linhaDestino === '8') || (cor === 'preto' && linhaDestino === '1')) {
        mostrarPromocao(destinoQuadrado.id);
    }
}

// Crie uma instância do Stockfish como um Worker
const stockfish = new Worker('path/to/stockfish.js');  // Caminho local para o arquivo

// Enviar comandos para o Stockfish
stockfish.postMessage('uci');  // Comando para iniciar o protocolo UCI

// Função para receber as respostas do Stockfish
stockfish.onmessage = function(event) {
  console.log("Resposta do Stockfish: ", event.data);
};

// Para enviar um comando de posição e analisar a jogada
stockfish.postMessage('position fen ' + tabuleiroParaFEN());
stockfish.postMessage('go depth 15');