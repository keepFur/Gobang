var chess = document.getElementById('chess'),
    context = chess.getContext('2d'),
    img = new Image(),
    isMe = true,
    chessBoard = [], //棋盘各个点的数组  二维数组
    wins = [], //赢法数组  三位数组
    count = 0, //赢法种类的索引
    myWin = [], //我方的赢法数组
    computerWin = [], //计算机的赢法数组
    gameOver = false, //游戏结束标记
    width = 30, //每一个格子的宽度
    height = 30, //每一个格子的高度
    chessBoardWidth = chess.clientWidth, //棋盘的宽度
    chessBoardHeight = chess.clientHeight, //棋盘的高度
    margin = 15, //四周的留白距离
    countX = Math.ceil((chessBoardWidth - margin * 2) / width) + 1, //横向的格子数量
    countY = Math.ceil((chessBoardHeight - margin * 2) / height) + 1; //纵向的格子数量
// 为棋盘各个点和赢法数组初始化   防止已经有旗子的地方再次落子
for (var i = 0; i < countX; i++) {
    chessBoard[i] = [];
    wins[i] = [];
    for (var j = 0; j < countX; j++) {
        chessBoard[i][j] = 0;
        wins[i][j] = [];
    }
}

//为映法数组赋值   
// 所有的横线的赢法
for (var i = 0; i < countX; i++) {
    for (var j = 0; j < countX - 4; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i][j + k][count] = true;
        }
        count++;
    }
}
// 所有的竖线的赢发
for (var i = 0; i < countX; i++) {
    for (var j = 0; j < countX - 4; j++) {
        for (var k = 0; k < 5; k++) {
            wins[j + k][i][count] = true;
        }
        count++;
    }
}
// 所有的斜线的赢发
for (var i = 0; i < countX - 4; i++) {
    for (var j = 0; j < countX - 4; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j + k][count] = true;
        }
        count++;
    }
}
// 所有的反斜线的赢发
for (var i = 0; i < countX - 4; i++) {
    for (var j = countX - 1; j > 3; j--) {
        for (var k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}

console.log(count);
//初始化赢法统计数组
for (var i = 0; i < count; i++) {
    myWin[i] = 0;
    computerWin[i] = 0;
}
context.strokeStrle = '#BFBFBF';
img.src = 'img/logo-new.png';
img.onload = function() {
    context.drawImage(img, 0, 0, 450, 450);
    drawChessBroad();
}

//画旗盘
var drawChessBroad = function() {
        for (var i = 0; i < countX; i++) {
            context.moveTo(margin + i * width, margin);
            context.lineTo(margin + i * width, chessBoardWidth - margin);
            context.stroke();
            context.moveTo(margin, margin + i * height);
            context.lineTo(chessBoardHeight - margin, margin + i * height);
            context.stroke();
        }
    }
    // 走棋子 i和j表示在棋盘上面的索引   isMe表示是白棋还是黑棋
var oneStep = function(i, j, isMe) {
        context.beginPath();
        context.arc(margin + i * width, margin + j * height, 13, 0, 2 * Math.PI);
        context.closePath();
        var gradient = context.createRadialGradient(margin + i * width + 2, margin + j * height - 2, 13, margin + i * width + 2, margin + j * height - 2, 0);
        //如果是黑棋的话
        if (isMe) {
            gradient.addColorStop(0, '#0A0A0A');
            gradient.addColorStop(1, '#636766');
        } else {
            gradient.addColorStop(0, '#d1d1d1');
            gradient.addColorStop(1, '#f9f9f9');
        }
        context.fillStyle = gradient
        context.fill();
    }
    // 为期盼绑定点击事件
chess.onclick = function(e) {
        //游戏结束的话或者不是我方下棋的话  直接退出游戏
        if (gameOver || !isMe) {
            return;
        }
        if (!isComplete()) {
            alert('和局');
            return;
        }
        var x = e.offsetX,
            y = e.offsetY,
            i = Math.floor(x / width), //棋盘的坐标x
            j = Math.floor(y / height); //棋盘的坐标Y
        if (chessBoard[i][j] == 0) {
            oneStep(i, j, isMe);
            chessBoard[i][j] = 1; //把棋盘上的点设置为有子了
            for (var k = 0; k < count; k++) {
                if (wins[i][j][k]) { //如果第k种赢法存在的话
                    myWin[k]++; //在第k种赢法上面加1 
                    computerWin[k] = 6; //同时在计算机的k种赢上面设置一个不可以赢的值   设置为大于5的数据都行
                    if (myWin[k] === 5) {
                        alert('恭喜你，赢了阿法狗');
                        gameOver = true; //游戏结束
                    }
                }
            }
            //如果游戏还没结束的话   把下棋的权利交给计算机
            if (!gameOver) {
                isMe = !isMe;
                computerAI();
            }
        }

    }
    //计算机下棋
var computerAI = function() {
        if (!isComplete()) {
            alert('和局了');
            return;
        }
        var myScore = [], //我方得分
            computerScore = [], //计算机得分
            max = 0, //最大分数
            ci = 0, //计算机落子的最佳点的横坐标
            cj = 0; //计算机落子的最佳点的纵坐标
        //初始化得分数组
        for (var i = 0; i < countX; i++) {
            myScore[i] = [];
            computerScore[i] = [];
            for (var j = 0; j < countY; j++) {
                myScore[i][j] = 0;
                computerScore[i][j] = 0;
            }
        }
        //遍历整个棋盘
        for (var i = 0; i < countX; i++) {
            for (var j = 0; j < countY; j++) {
                if (chessBoard[i][j] == 0) { //某一个点没有旗子的话
                    //遍历所有的赢法 
                    for (var k = 0; k < count; k++) {
                        if (wins[i][j][k]) {
                            //计算机拦截的情况
                            if (myWin[k] == 1) {
                                myScore[i][j] += 200;
                            } else if (myWin[k] == 2) {
                                myScore[i][j] += 400;
                            } else if (myWin[k] == 3) {
                                myScore[i][j] += 2000;
                            } else if (myWin[k] == 4) {
                                myScore[i][j] += 10000;
                            }
                            //计算机本身落子的情况
                            if (computerWin[k] == 1) {
                                computerScore[i][j] += 220;
                            } else if (computerWin[k] == 2) {
                                computerScore[i][j] += 420;
                            } else if (computerWin[k] == 3) {
                                computerScore[i][j] += 2100;
                            } else if (computerWin[k] == 4) {
                                computerScore[i][j] += 20000;
                            }

                        }
                    }
                    if (myScore[i][j] > max) {
                        max = myScore[i][j];
                        ci = i;
                        cj = j;
                    } else if (myScore[i][j] == max) {
                        if (computerScore[i][j] > computerScore[ci][cj]) {
                            ci = i;
                            cj = j;
                        }
                    }
                    if (computerScore[i][j] > max) {
                        max = computerScore[i][j];
                        ci = i;
                        cj = j;
                    } else if (computerScore[i][j] == max) {
                        if (myScore[i][j] > myScore[ci][cj]) {
                            ci = i;
                            cj = j;
                        }
                    }
                }
            }
        }
        //计算机落子
        oneStep(ci, cj, false);
        chessBoard[ci][cj] = 2;
        for (var k = 0; k < count; k++) {
            if (wins[ci][cj][k]) { //如果第k种赢法存在的话
                computerWin[k]++; //在第k种赢法上面加1 
                myWin[k] = 6; //同时在计算机的k种赢上面设置一个不可以赢的值   设置为大于5的数据都行
                if (computerWin[k] === 5) {
                    alert('恭喜你，阿法狗赢了人类');
                    gameOver = true; //游戏结束
                }
            }
        }
        //如果游戏还没结束的话   把下棋的权利交给计算机
        if (!gameOver) {
            isMe = !isMe;
        }
    }
    //判断棋盘是否还有空白的地方   有的话返回true
var isComplete = function() {
    var flag = false;
    for (var i = 0; i < countX; i++) {
        for (var j = 0; j < countY; j++) {
            if (chessBoard[i][j] == 0) {
                flag = true;
                break;
            }
        }
    }
    return flag;
}