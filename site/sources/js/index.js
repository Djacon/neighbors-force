function stringObjectToNumbers(formData) {
    const obj = {};
    Object.keys(formData).forEach((key, index) => {
        obj[key] = parseInt(formData[key]);
    });
    return obj;
}

function sendFormData(formData) {
    console.log(Array.from(formData.entries()))
    console.log(Object.fromEntries(formData))
    const requestData = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stringObjectToNumbers(Object.fromEntries(formData)))
    };

    return fetch('/api/game/create', requestData)
        .then(response => response.json());
}

function startNewGame(data) {
    const board = data.board;
    const players = data.players;
    const turn = data.turn

    boardElement = renderNewBoard(board)
    markCanAttack(boardElement, turn)
    addClickHandlers(boardElement)
}

function renderNewBoard(board) {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";

    for (let row = 0; row < board.rows; row++) {
        const table = document.createElement("table");
        table.id = "table-" + row;
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);
        for (let col = 0; col < board.cols; col++) {
            const cell = board.cells[row][col];
            const td = document.createElement("td");
            td.id = row * board.cols + col;
            td.setAttribute("power", cell.power);
            if (cell.owner_id >= 0) {
                td.setAttribute("owner-id", cell.owner_id);
            }

            const div = document.createElement("div");
            div.classList.add("num");
            div.id = "cell-n-" + (row * board.cols + col);
            div.innerText = cell.power;

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
            use.setAttribute("href", "#hexagon");
            svg.appendChild(use);

            td.appendChild(div);
            td.appendChild(svg);
            tbody.appendChild(td);
        }
        boardElement.appendChild(table);
    }

    return boardElement
}

function markCanAttack(boardElement, turn) {
    const tables = boardElement.getElementsByTagName('table');
    for (let i = 0; i < tables.length; i++) {
        const cells = tables[i].getElementsByTagName('td');
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            const owner_id = parseInt(cell.getAttribute('owner-id'));
            if (owner_id == turn) {
                cell.classList.add('can-attack');
            } else {
                cell.classList.remove('can-attack');
            }
        }
    }
}

function addClickHandlers(boardElement) {
    const tables = boardElement.querySelectorAll('table');

    tables.forEach(table => {
        const tds = table.querySelectorAll('td');

        tds.forEach(td => {
            if (td.classList.contains('can-attack')) {
                td.onclick = () => {
                    console.log('click!');
                    markCanBeAttacked(boardElement, this)

                    const allTds = table.querySelectorAll('td');
                    allTds.forEach(otherTd => {
                        if (otherTd.classList.contains('can-be-attacked')) {
                            otherTd.onclick = () => {
                                console.log('Other cell clicked!');
                                unmarkCanBeAttacked(boardElement)
                            };
                        }
                    });
                };
            } else {
                td.onclick = null;
            }
        });
    });

    // document.onclick = (event) => {
    //     const target = event.target;

    //     if (!target.matches('td')) {
    //         tables.forEach(table => {
    //             const tds = table.querySelectorAll('td');
    //             tds.forEach(td => {
    //                 td.onclick = null;
    //             });
    //         });
    //     }
};


function markCanBeAttacked(boardElement, attackTd) {
    const tables = boardElement.querySelectorAll('table');

    tables.forEach(table => {
        const tds = table.querySelectorAll('td');

        tds.forEach(td => {
            if (!td.classList.contains('can-attack')) {
                td.classList.add('can-be-attacked')
            }
        })
    })
}

function unmarkCanBeAttacked(boardElement, attackTd) {
    const tables = boardElement.querySelectorAll('table');

    tables.forEach(table => {
        const tds = table.querySelectorAll('td');

        tds.forEach(td => {
            if (td.classList.contains('can-be-attacked')) {
                td.classList.remove('can-be-attacked')
            }
        })
    })
}


function main() {
    const form = document.querySelector('#game-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        console.log(formData)
        sendFormData(formData)
            .then(data => startNewGame(data))
            .catch(error => console.error(error));
    });
}

document.addEventListener('DOMContentLoaded', main);

