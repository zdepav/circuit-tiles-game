let levels = [
    [
        ["rd", "rdl", "dl", "d", "r", "ld", "dr", "dl"],
        ["urd", "udl", "urd", "urdl", "rdl", "ul", "du", "u"],
        ["u", "urd", "url", "ul", "ud", "d", "dru", "ld"],
        ["r", "url", "rdl", "l", "urd", "lur", "ul", "ud"],
        ["rd", "lr", "rlu", "rld", "rudl", "l", "dr", "dul"],
        ["ru", "lr", "lr", "lu", "ur", "lr", "lru", "lu"]
    ],
    [
        ["rd", "lr", "lrd", "lr", "lr", "lrd", "drl", "dl"],
        ["du", "d", "rdu", "rl", "rld", "rdlu", "ldu", "du"],
        ["dur", "rudl", "rul", "ld", "u", "ur", "dlru", "dul"],
        ["dur", "lru", "dl", "dur", "rl", "rld", "lu", "du"],
        ["du", "dr", "lru", "ulr", "ld", "rud", "rl", "dul"],
        ["ur", "lru", "rl", "rl", "rul", "rlu", "rl", "ul"]
    ],
    [
        ["d", "rd", "l", "r", "dl", "d"],
        ["ur", "lud", "d", "dr", "lur", "lu"],
        ["dr", "uld", "du", "dru", "ld", "d"],
        ["u", "dru", "drul", "ul", "udr", "dlu"],
        ["d", "du", "ru", "dl", "u", "du"],
        ["ur", "ul", "r", "lu", "r", "lu"]
    ]
];

function setRotation(element, rotation) {
    element.css("transform", "rotate(" + rotation * 90 + "deg)");
}

function getTileType(sides) {
    switch (sides) {
        case "":
            return '.';
        case "u":
        case "r":
        case "d":
        case "l":
            return 'i';
        case "r u":
        case "d r":
        case "d l":
        case "l u":
            return 'L';
        case "l r":
        case "d u":
            return 'I';
        case "d r u":
        case "d l r":
        case "d l u":
        case "l r u":
            return 'T';
        case "d l r u":
            return '+';
        default:
            return '?';
    }
}

function checkTile(t) {
    switch (t.type) {
        case '.':
        case '+':
            return true;
        case 'I':
            return t.rotation % 2 === 0;
        case 'i':
        case 'L':
        case 'T':
            return t.rotation % 4 === 0;
        default:
            return false;
    }
}

function checkWin(tiles) {
    for (let t of tiles) {
        if (!checkTile(t)) {
            return false;
        }
    }
    return true;
}

let game = $('<div class="game"></div>');
let scores = [];

function addRetryButton(button) {
    button.text("Replay");
    button.addClass("retryButton");
    button.on("click", function () {
        game.empty();
        runGame();
    });
}

function buildScoresTable() {
    let text = scores.length > 1 ? "Past scores:" : "Past score:";
    let scoreTable = $('<table class="scores"><thead><tr><th>' + text + '</th></tr></thead></table>');
    let tbody = $('<tbody></tbody>');
    scoreTable.append(tbody);
    for (let s of scores) {
        tbody.append($('<tr><td>' + s.str + '</td></tr>'))
    }
    return scoreTable;
}

function runGame() {
    let level = Math.floor(Math.random() * levels.length);
    let field = levels[level];
    let levelValid = true;
    if (field.length <= 0 || field[0].length <= 0) {
        levelValid = false;
    } else {
        for (let i = 1; i < field.length; ++i) {
            if (field[i].length !== field[0].length) {
                levelValid = false;
                break;
            }
        }
    }
    if (!levelValid) {
        throw new Error("Invalid level " + level + ".");
    }
    let tiles = [];
    let table = $(
        '<table class="tiles"><thead><tr><th colspan="' +
        field[0].length +
        '"><div class="header fullRow">00:00</div></th></tr></thead></table>'
    );
    game.append(table);
    if (scores.length > 0) {
        game.append(buildScoresTable());
    }
    let tbody = $('<tbody></tbody>');
    table.append(tbody);
    let won = false;
    let startTime = 0;
    let retryButton = $('<div class="fullRow"></div>');
    let retryButtonTd = $('<td colspan="' + field[0].length + '"></td>');
    retryButtonTd.append(retryButton);
    let retryButtonTr = $('<tr></tr>');
    retryButtonTr.append(retryButtonTd);

    for (let y = 0; y < field.length; ++y) {
        let tr = $("<tr></tr>");
        for (let x = 0; x < field[0].length; ++x) {
            let tile = field[y][x].trim().split('').sort().join(' ');
            let type = getTileType(tile);
            if (type === '?') {
                throw new Error("Invalid tile [" + field[y][x] + "].");
            }
            let div = $("<div><div></div></div>");
            let cls = "tile " + tile;
            if (tile.length < 2) {
                cls += " c";
            }
            let tag = {
                x: x,
                y: y,
                cls: cls,
                rotation: 1 + Math.floor(Math.random() * 3),
                element: div,
                type: type
            };
            div.attr("class", tag.cls);
            setRotation(div, tag.rotation);
            div.on("click", function () {
                if (won) {
                    return;
                }
                ++tag.rotation;
                setRotation(div, tag.rotation);
                won = checkWin(tiles);
                if (won) {
                    table.addClass("won");
                    addRetryButton(retryButton);
                }
            });
            let td = $("<td></td>");
            td.append(div);
            tr.append(td);
            tiles.push(tag);
        }
        tbody.append(tr);
    }
    tbody.append(retryButtonTr);
    let header = $(".header");
    startTime = performance.now();

    function updateTime() {
        let time = performance.now() - startTime;
        let seconds = Math.floor(time / 1000 % 60);
        let minutes = Math.floor(time / 60000 % 60);
        let hours = Math.floor(time / 3600000);
        let timeStr = hours > 0 ? hours + ":" : "";
        timeStr += minutes >= 10 ? minutes : "0" + minutes;
        timeStr += seconds >= 10 ? ":" + seconds : ":0" + seconds;
        header.text(timeStr);
        if (won) {
            scores.push({str: timeStr, value: time});
            scores.sort(function (a, b) {
                return a.value - b.value;
            })
            if (scores.length > 10) {
                scores.pop();
            }
        } else {
            setTimeout(updateTime, 100);
        }
    }

    setTimeout(updateTime, 100);
}

$(function () {
    if (levels.length <= 0) {
        return;
    }
    let startButton = $('<div class="start-button-container"><div class="start-button">Start game</div></div>');
    startButton.on("click", function () {
        game.empty();
        runGame();
    });
    game.append(startButton);
    $("body").append(game);
});
