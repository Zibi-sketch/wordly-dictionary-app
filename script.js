let inputField = document.getElementById("input");
let enterButton = document.getElementById("submit-button");
let preview = document.getElementById("preview");
let form = document.getElementById("form");
let searchResults = document.getElementById("result-box");
let failedAudio = document.getElementById("audio-fail");
let errorContainer = document.getElementById("error-message");
let pronunciation = document.getElementById("pronunciation");
let datasList = document.getElementById("meaningsList");
let synonymList = document.getElementById("synonym-list");
let antonymList = document.getElementById("antonym-list");
let playButton = document.getElementById("audio-playback-button");




form.addEventListener('submit', (event) => {
    event.preventDefault();

    //make a new audio button for the upcoming word pronunciation
    let audioButton = document.createElement("button");

    audioButton.id = "temporary-button";
    audioButton.textContent = "Play Audio";
    audioButton.style.display = "none";//Hide until an input is made

    playButton.innerHTML = "";
    playButton.appendChild(audioButton);

    //Clear the audio error-message if it had popped up before
    if (failedAudio) failedAudio.textContent = "";

    //clear the preview
    preview.textContent = "";

    //Take the users input
    let word = inputField.value;

    //Display a message if User submits nothing
    if (word !== "") {
        lookForWord(word);
    }
    else {
        if (searchResults) {
            searchResults.innerHTML = "";
            errorContainer.classList.add("hidden");
        }
        if (errorContainer) {
            errorContainer.innerHTML = "";
            errorContainer.classList.remove("hidden");
        }
            let blankMessage = document.createElement("p");
            blankMessage.textContent = "You haven't filled out this field yet👀"
            errorContainer.appendChild(blankMessage);
        }
        //Clear input field after submission:
        inputField.value = "";
    })

inputField.addEventListener('input', () => {
    //Including a preview of what you're writing because why not?
    preview.textContent = 'Are you looking for "' + inputField.value + '"?';
})

function lookForWord(word) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error;//Go straight to catch if something's wrong
            }
        })

        .then(function (response) {
            //Clear any previous error messages if any
            errorContainer.textContent = "";
            errorContainer.classList.add("hidden");

            //Give the info to another function
            discoverInfo(response);
        })

        .catch(error => {
            //Erase all previous results if any
            if (searchResults) {
                searchResults.innerHTML = "";
            }

            //Erase any error messages if any and create a new one
            if (errorContainer) {
                errorContainer.innerHTML = "";
                errorContainer.classList.remove("hidden");
                let errorMessage = document.createElement("p");

                errorMessage.textContent = `Sorry! We couldn't find that word.😓 \n Please try again`;
                errorContainer.appendChild(errorMessage);

                //Tell me what's wrong exactly
                console.log("Sorry, there's been an error:", error.message);
            }
        })

}

function discoverInfo(info) {

    //DISPLAYING THE ACTUAL WORD:
    let spelling = document.getElementById("word");
    spelling.textContent = info[0].word;

    //DISPLAYING THE WORD'S PRONUNCIATION OR OTHERWISE AN ERROR MESSAGE:
    const phoneticEntry = info[0].phonetics.find(p => p.text) || info[0];
    pronunciation.textContent = phoneticEntry.text || "No pronunciation available";


    //DISPLAYING THE WORD'S data:
    //clear the container of any previous definitions
    datasList.innerHTML = "";

    //Look for and display new definitions
    let definitions = info[0].meanings;
    definitions.forEach((def) => {
        let eachDef = document.createElement("div")//smaller box
        let partOfSpeech = document.createElement("h3");//Subheading
        partOfSpeech.textContent = def.partOfSpeech;

        let defsList = document.createElement("ul");

        def.definitions.forEach((diff) => {
            let oneDef = document.createElement("li");
            oneDef.textContent = diff.definition;
            defsList.appendChild(oneDef);
        })
        eachDef.appendChild(partOfSpeech);
        eachDef.appendChild(defsList);
        datasList.appendChild(eachDef);
    })



    //PLAY PRONUNCIATION MP3:
    let audioButton = document.getElementById("temporary-button");
    let audioURL = info[0].phonetics.find(p => p.audio !== "")?.audio;

    //Emptying the audio message container before adding new stuff
    failedAudio.textContent = "";

    if (audioURL) {
        audioButton.style.display = "block";//Reveal yourself if an audio file is available to play:)

        //play audio function
        audioButton.onclick = () => {
            let audio = new Audio(audioURL);//newAudio method converts URL to record player
            audio.play();
        }
    }
    else {//If no audio is available, display error an error message in place of the button
        audioButton.style.display = "none";
        failMessage = document.createElement("p");
        failMessage.textContent = "Sorry! No audio available."
        failedAudio.appendChild(failMessage);
    }

    //DISPLAYING SYNONYMES AND ANTONYMES:
    //Display synonymes:
    //clear the container of old info
    if (synonymList) {
        synonymList.innerHTML = "";
    }

    //Look for and display new synonymes

    definitions.forEach(data => {

        if (data.synonyms?.length > 0) {
            let eachSyn = document.createElement("div")//smaller box
            let synonymTitle = document.createElement("h3");//Subheading
            synonymTitle.textContent = "Synonyms";
            let symsList = document.createElement("ul");

            data.synonyms.forEach(synonym => {
                let oneSyn = document.createElement("li");
                oneSyn.textContent = synonym;
                symsList.appendChild(oneSyn);
            });
            eachSyn.appendChild(synonymTitle);
            eachSyn.appendChild(symsList);
            synonymList.appendChild(eachSyn);
        }
    });


    //Display antonyms:
    //clear the container of old info
    if (antonymList) {
        antonymList.innerHTML = "";
    }

    //Look for and display new antonyms

    definitions.forEach(data => {
        if (data.antonyms?.length > 0) {
            let eachAnt = document.createElement("div")//smaller box
            let antonymTitle = document.createElement("h3");//Subheading
            antonymTitle.textContent = "Antonyms";

            let antList = document.createElement("ul");
            data.antonyms.forEach(antonym => {
                let oneAnt = document.createElement("li");
                oneAnt.textContent = antonym;
                antList.appendChild(oneAnt);
            });

            eachAnt.appendChild(antonymTitle);
            eachAnt.appendChild(antList);
            antonymList.appendChild(eachAnt);

        }
    });


}