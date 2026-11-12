# Viver em Angola — Protótipo 0.2.1

Jogo web 3D em primeira pessoa, inspirado em Luanda, com opção de alternar para terceira pessoa para ver o personagem.

## O que foi acrescentado
- Fachadas com varandas, pequenas lojas/toldos, postes de iluminação e bancos.
- Personagem 3D low-poly com cabeça, tronco, braços e pernas.
- Animação básica de braços e pernas ao andar/correr.
- Câmara inicial em primeira pessoa; tecla **V** (computador) ou botão **VISTA** (Android) alterna para terceira pessoa.
- Controlos de teclado/rato e controlos tácteis.
- Logótipo VA redesenhado e favicon próprio.
- No Android, o botão **VISTA** aparece no lado direito durante o jogo; toca nele para alternar entre primeira e terceira pessoa.

## Como executar
O projeto usa Three.js como módulo JavaScript carregado de uma CDN. É necessária ligação à internet na primeira abertura e um servidor HTTP que suporte módulos ES.

### Computador
1. Extrai o ZIP.
2. Abre a pasta num editor como VS Code.
3. Inicia um servidor local (por exemplo, a extensão Live Server) e abre o endereço local indicado.
4. WASD para andar, rato para olhar, Shift para correr, E para interagir, V para alternar a câmara.

### Android
1. Extrai o ZIP.
2. Envia a pasta para um alojamento estático ou servidor local compatível com módulos ES.
3. Abre o endereço HTTPS no Chrome.
4. Usa o joystick para andar, arrasta sobre o cenário para olhar, Correr para acelerar, Interagir junto ao marcador e VISTA para alternar a câmara.

Abrir o ficheiro `index.html` diretamente como `file://` pode falhar porque os navegadores restringem módulos ES. Usa um servidor HTTP/HTTPS.

## Publicar gratuitamente com GitHub Pages
1. Cria uma conta GitHub e um repositório público.
2. Envia todos os ficheiros e pastas mantendo a estrutura.
3. Vai a **Settings → Pages**.
4. Em **Build and deployment**, escolhe **Deploy from a branch**, branch `main` e pasta `/ (root)`.
5. Guarda e aguarda a publicação. O GitHub apresenta o endereço do site nessa página.

## Limitações atuais
Este é um protótipo de demonstração: a cidade é gerada por formas 3D simples, não é uma reprodução geográfica exata de Luanda. Ainda não há colisões completas, tráfego ativo, salvamento, contas ou multijogador. A aparência e o desempenho variam conforme o dispositivo.

## Abrir directamente no Chrome
O ZIP não cria sozinho um endereço público. Para teres um link HTTPS que possas abrir no Chrome, publica esta pasta no GitHub Pages seguindo os passos acima. Depois de publicado, o GitHub fornece o link do jogo. Não existe ainda um link público criado para esta versão.
