// 要素の取得
const memoInput = document.getElementById("memo-input");
const dueDateInput = document.getElementById("due-date");
const addButton = document.getElementById("add-btn");
//const memoList = document.getElementById("memo-list");
const memoContainer = document.getElementById("memo-container");
const boardContainer = document.getElementById("board-container");

// 色選択時にローカルストレージに保存
const colorSelect = document.getElementById("fusen-color");

// 初期値を設定（ローカルストレージに保存された色があれば、それを設定）
const savedColor = localStorage.getItem("fusenColor") || "white"; // デフォルトは黄色
colorSelect.value = savedColor; // 初期選択を反映

colorSelect.addEventListener("change", function () {
    const selectedColor = colorSelect.value;
    localStorage.setItem("fusenColor", selectedColor);  // 選択された色をローカルストレージに保存
});

//メモの色を取得するための関数
function getColor(color) {
    const colorMapping = {
        "red": "#FF66B5",
        "yellow": "#FFFC66",
        "blue": "#B3E6FF"
    };
    return colorMapping[color] || "FFFC66"; //デフォルトは黄色
}

// ローカルストレージからメモを読み込む
function loadMemos() {
    const memos = JSON.parse(localStorage.getItem("memos")) || [];
    // 既存のメモをクリア
    const currentMemos = document.querySelectorAll(".memo");
    currentMemos.forEach(memo => memo.remove()); //既存の付箋を削除

    memos.forEach((memo, index) => {
        const memoFusen = document.createElement("div");
        memoFusen.classList.add("memo");
        memoFusen.setAttribute("data-index", index);
        //初期の位置を設定する
        memoFusen.style.left = `${memo.x || 100}px`;
        memoFusen.style.top = `${memo.y || 100}px`;
        
        //メモごとに色を設定する
        const memoColor = memo.color || "#FFFC66"; //メモに保存された色、なければデフォルト色（黄色）
        memoFusen.style.backgroundColor = memoColor; 

        //〆切日を時間まで設定
        const dueDate = new Date(memo.dueDate);
        //「M/D　H:MM」の表記になるようにする（時間と秒は0を埋める）
        const dueDateFormatted = `${dueDate.getMonth() + 1}/${dueDate.getDate()} ${dueDate.getHours().toString().padStart(2,"0")}:${dueDate.getMinutes().toString().padStart(2,"0")}`;
        
        //const li = document.createElement("li");
      //  li.innerHTML = `
      //      <div>
      //          <p>${memo.text}</p>
      //          <span class="memo-time">${memo.date}</span>
      //          <span class="memo-due">〆切：${memo.dueDate}</span>
      //      </div>
      //      <button class="delete-btn" onclick="deleteMemo(${index})">削除</button>
        //  `;
        
        memoFusen.innerHTML =`
            <p>${memo.text}</p>
            <span class= "memo-time">${memo.date}</span><br>
            <span class= "memo-due"> 〆切日：${dueDateFormatted} </span><br>
            <button class= "delete-btn" onclick="deleteMemo(${index})">削除</button>
        `;
        
        //ドラッグイベントの設定
        memoFusen.addEventListener("mousedown",startDrag);
        boardContainer.appendChild(memoFusen);                    
    });
}

// メモを追加する
function addMemo() {
    const memoText = memoInput.value.trim(); //空白を除外して保存できるようにする
    const dueDate = dueDateInput.value;

    if (memoText === "" || !dueDate) return; //メモの〆切日が空欄の場合処理を中断する

    // 現在の日時を取得
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // 日付と時間をフォーマット

    //入力された〆切日をそのまま使用する
    const formattedDueDate = dueDate; //"YYYY-MM-DD THH:mm"形式

    //色を選択（ドロップリストから選ばれた色を取得）
    const selectedColor = document.getElementById("fusen-color").value;
    
    // ローカルストレージからメモのリストを取得
    const memos = JSON.parse(localStorage.getItem("memos")) || [];
    const newMemo = {
        text: memoText, //メモ内容
        date: formattedDate, //メモした日付
        dueDate: formattedDueDate, //〆切日
        x: 100, //初期x位置
        y: 100,  //初期y位置
        color: selectedColor //色を追加 
    };

    memos.push(newMemo); // 新しいメモを追加

    // ローカルストレージに保存
    localStorage.setItem("memos", JSON.stringify(memos));

    //新規メモを即座に表示
    const memoFusen = document.createElement("div");
    memoFusen.classList.add("memo");
    memoFusen.setAttribute("data-index", memos.length - 1); // 新しいインデックスを設定
    memoFusen.style.left = `${newMemo.x}px`;  // 初期x位置
    memoFusen.style.top = `${newMemo.y}px`;  // 初期y位置
    memoFusen.style.backgroundColor = getColor(selectedColor); // 色を設定

    const dueDateObj = new Date(newMemo.dueDate);
    const dueDateFormatted = `${dueDateObj.getMonth() + 1}/${dueDateObj.getDate()} ${dueDateObj.getHours().toString().padStart(2,"0")}:${dueDateObj.getMinutes().toString().padStart(2,"0")}`;

    memoFusen.innerHTML = `
        <p>${newMemo.text}</p>
        <span class="memo-time">${newMemo.date}</span><br>
        <span class="memo-due">〆切日：${dueDateFormatted}</span><br>
        <button class="delete-btn" onclick="deleteMemo(${memos.length - 1})">削除</button>
    `;
    
    // ドラッグイベントの設定
    memoFusen.addEventListener("mousedown", startDrag);

    // メモ貼り付けエリアに追加
    boardContainer.appendChild(memoFusen);

    // メモリストを更新
    loadMemos();

    // 入力欄をクリア
    memoInput.value = ""; //入力欄のクリア
    dueDateInput.value = ""; //〆切日欄のクリア
}

//メモのドラッグ処理
let draggedMemo = null;
let offsetX, offsetY;

function startDrag(event) {
    draggedMemo = event.target;
    offsetX = event.clientX - draggedMemo.offsetLeft;
    offsetY = event.clientY - draggedMemo.offsetTop;

    //mousemoveのイベントリスナーを追加
    document.addEventListener("mousemove",dragMemo);
    document.addEventListener("mouseup", stopDrag); //stopDragをmouseupで呼び出す
}

function dragMemo(event) {
    if (!draggedMemo) return;
    draggedMemo.style.left = `${event.clientX - offsetX}px`;
    draggedMemo.style.top = `${event.clientY - offsetY}px`;
}

function stopDrag() {
    if (!draggedMemo) return;
    const index = draggedMemo.getAttribute("data-index");
    const memos = JSON.parse(localStorage.getItem("memos")) || [];

    //新しい位置を保存
    const memo = memos[index];
    memo.x = parseInt(draggedMemo.style.left);
    memo.y = parseInt(draggedMemo.style.top);

    localStorage.setItem("memos", JSON.stringify(memos));

    //イベントリスナーの削除
    draggedMemo = null; //draggedMemoの参照を解除する
    document.removeEventListener("mousemove", dragMemo); //mousemoveイベントリスナーを削除
    document.removeEventListener("mouseup", stopDrag); //mouseupイベントリスナーを削除
}
let currentDeleteIndex = null; //削除するメモのインデックスを保持

// メモを削除する
function deleteMemo(index) {
    currentDeleteIndex = index; //削除対象のメモのインデックスを保持
    const deletePopup = document.getElementById("delete-popup");
    deletePopup.style.display = "flex"; //ポップアップの表示
    
    //「はい」を押した場合にメモを削除する
    document.getElementById("confirm-delete").addEventListener("click", function () {
        if (currentDeleteIndex !== null) {
            const memos = JSON.parse(localStorage.getItem("memos")) || [];
            memos.splice(index, 1); // 指定されたインデックスのメモを削除    

            // ローカルストレージに保存
            localStorage.setItem("memos", JSON.stringify(memos));

            // メモリストを更新
            loadMemos();
        }
    
        //ポップアップを非表示にする
        document.getElementById("delete-popup").style.display = "none";
        currentDeleteIndex = null; //インデックスをリセット
    });
    
    //「キャンセル」を押した場合の処理
    document.getElementById("cancel-delete").addEventListener("click", function () {
        //ポップアップの非表示
        document.getElementById("delete-popup").style.display = "none";
        currentDeleteIndex = null; //インデックスをリセット
    });
}

// リマインダー通知をポップアップ形式で表示する
function checkReminders() {
    const memos = JSON.parse(localStorage.getItem("memos")) || [];
    const currentDate = new Date();

    //設定したリマインダーの時間を取得
    const reminderTime = parseInt(document.getElementById("reminder-time").value) || 1; //デフォルトを1時間前に設定

    memos.forEach(memo => {
        const dueDate = new Date(memo.dueDate);

        //もし「10分後に再通知する」を押した場合、次のリマインド時間を10分後に設定
        if (memo.nextReminderTime && new Date(memo.nextReminderTime) > currentDate) {
            //10分後に再度リマインド
            return;
        }
        
        //リマインダー時間の差を計算する（ミリ秒単位）
        const timeDifference = dueDate - currentDate;
        const reminderTimeMs = reminderTime * 60 * 60 * 1000 //設定した時間をミリ秒に変換する

        //リマインド時間になったらポップアップを表示
        if (timeDifference > 0 && timeDifference <= reminderTimeMs) {
            //リマインダーのメッセージをポップアップにセット
            const reminderMessage = `「${memo.text}」の〆切まで残り${reminderTime}時間です！リマインダーを終了しますか？`;

            //ポップアップにメッセージをセット
            document.getElementById("reminder-message").textContent = reminderMessage;

            //ポップアップを表示する
            const reminderPopup = document.getElementById("reminder-popup");
            reminderPopup.style.display = "flex";

            //「はい」を押した場合にポップアップを閉じる
            document.getElementById("confirm-reminder").addEventListener("click", function () {
                reminderPopup.style.display = "none"; //ポップアップを閉じる
            });

            //「また10分後に再通知する」を押した場合にポップアップを閉じる
            document.getElementById("cancel-reminder").addEventListener("click", function () {
                //ポップアップを閉じる
                reminderPopup.style.display = "none";
                //次回リマインド時間を10分後に設定
                memo.nextReminderTime = new Date(currentDate.getTime() + 10 * 60 * 1000); //現在の時刻に10分を追加
                //ローカルストレージに保存する
                memos[index] = memo;
                localStorage.setTime("memos", JSON.stringify(memos));
            
            });
        }
    });
}

// イベントリスナー
addButton.addEventListener("click", addMemo);
memoInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addMemo();
    }
});

// 最初のメモを読み込む
loadMemos();

//リマインダーを定期的にチェックする（1分ごとに行う）
setInterval(checkReminders, 60000); //1分ごとにリマインダーをチェックする
