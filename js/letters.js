/**
 * Created by User on 20-Jan-16.
 */
var letters = {};
(function(letters){

    var currentWord = '';
    var numberOfLives = 0;
    var score = 0;
    var highScores = [];

    function init() {
        generateHigScoreList(5);
        //Bind start to start button
        startBtn();
    }init();

    function getServerData(){
        $.ajax({
            url: "data",
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log(data);
                word = data;
                main(word);
            }
        });
    }

    function main (word) {
        generateWord(word);
        generatePlaceholders(word);
        generateLives(word);
        showScore();
        makeDroppable($(".letter.placeholder"));
        makeDraggable($(".letter").not(".placeholder"));
    }

    //Word
    function generateWord(word) {
        //Store current word
        currentWord = word;
        var shuffledWord = shuffleWord(word);
        displayWord(shuffledWord);
    }

    function displayWord(word){
        word.forEach(function(letter){
            $letterDiv = $('<div></div>', {text:letter});
            $letterDiv.addClass('letter shadowed');
            $(".letters").append($letterDiv);
        });

    }

    function shuffleWord(word) {
        return word.split('').sort(function(){return 0.5-Math.random()});
    }

    //Placeholders
    function generatePlaceholders(word) {
        displayPlaceholders (word);
    }

    function displayPlaceholders (word) {
        for (var i=0; i<word.length; i++) {
            $placeholderDiv = $('<div></div>');
            $placeholderDiv.addClass('letter placeholder');
            $placeholderDiv.attr('letter', word[i]);
            $(".guess-holder").append($placeholderDiv);
        }
    }

    //Lives
    function generateLives(word){
        numberOfLives = Math.ceil(word.length/2);
        displayLives(numberOfLives);
    }

    function displayLives (numberOfLives) {
        for (var lives=0; lives<numberOfLives; lives++) {
            $livesDiv = $('<img>', {src: "./images/heart.png"});
            $livesDiv.addClass('heart');
            $(".hearts-holder").append($livesDiv);
        }
    }

    function removeLife(){
        numberOfLives--;
        $('.heart')[0].remove();
    }

    //Drag & drop
    function makeDroppable(element) {
        element.droppable({
            // Accept only elements which have the same letter
            accept: function(draggable) {
               if (draggable.html() === $(this).attr('letter')){
                   return true;}
            },
            //"pointer": Mouse pointer overlaps the droppable.
            tolerance: "pointer",
            drop: function(event, ui) {
                //Add guessed=true to the placeholder
                $(this).attr('guessed', true);
                //Change properties to dropped element
                ui.draggable.css('background-color', 'green');
                ui.draggable.css({top: this.offsetTop-3, left: this.offsetLeft-3, position: 'absolute'});
                //Check if word completed and start new game
                if (checkIfWordCompleted()){
                    score += 10*numberOfLives;
                    showScore();
                    startNewGame();
                }
            }
        });
    }

    function makeDraggable (element) {
        element.draggable({
            //snap: $(".letter.placeholder"),
            //snapMode: "both",
            //snapTolerance: 30,

            //Container is the droppable
            revert: function(container){
                if (container === false){
                    removeLife();
                    if (checkGameOver(numberOfLives)){
                        gameOver();
                    }
                    return true;
                }
            }
        });
    }

    //Game Over
    function checkGameOver (numberOfLives) {
        if (numberOfLives === 0){return true;}
    }

    function gameOver () {
        updateHighScores();
        $('#game').removeClass('shown');
        $('#game-over').addClass('shown');
    }

    //Word Completed
    function checkIfWordCompleted (){
        //Get elements(in this case letter placeholders) that have an attribute named guessed and is equal to true.
        //If the length of this array is equal to the word's length, word completed
        return $("[guessed=true]").length === currentWord.length;
    }

    //High Scores
    function updateHighScores () {
         //Send score to the server
        $.ajax({
            url: "highscores",
            type: "POST",
            data: {score: score},
            dataType: "json",
            success: function (data) {
                highScores = data;
                //Order highscores in the html
                var highScoreIndex = 0;
                var userPlaceClassAdded = false;
                $('.gamebox-header ol li').each(function() {
                    $(this).html(highScores[highScoreIndex]);
                    if (highScores[highScoreIndex] === score && !userPlaceClassAdded){
                        $(this).attr('class', 'user-place');
                        userPlaceClassAdded = true;
                    }
                    highScoreIndex++;
                });
                userPlaceClassAdded = false;
            }
        });
    }

    function generateHigScoreList (numberOfHighScores) {
        for (var s=0; s<numberOfHighScores; s++) {
            $highScoreDiv = $('<li></li>');
            $('.gamebox-header ol').append($highScoreDiv);
        }
    }

    function showScore () {
        $(".user-score").html(score);
    }

    //Reset
    function reset () {
       $(".letter.placeholder").each(function(placeholderDiv){
            this.remove();
       });

        $(".letter").not(".placeholder").each(function(letterDiv){
            this.remove();
       });

       $('.gamebox-header ol li').each(function() {
           $(this).removeClass('user-place');
        });
    }

    function resetLives(){
        numberOfLives = 0;
        $(".heart").each(function(life) {
            this.remove();
        });
    }

    function resetScore() {
        score = 0;
    }

    //New Game
    function startNewGame (){
        resetLives();
        reset();
        getServerData();
        // Show game div and hide game-start and game-over
        $('#game-start').removeClass('shown');
        $('#game-over').removeClass('shown');
        $('#game').addClass('shown');
    }

    //Buttons
    function startBtn(){
        $(".start-btn").unbind().bind("click", function() {
            resetScore();
            startNewGame();
        });
    }

}(letters));
