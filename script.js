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

    //Clear the audio error-message if it had popped up before
    if (failedAudio) failedAudio.textContent = "";

    //clear the preview
    preview.textContent = "";

    //Take the users input
    let word = inputField.value;
    lookForWord(word);

    inputField.value = "";
})

inputField.addEventListener('input', () => {
    //Including a preview of what you're writing because why not?
    preview.textContent = 'Are you looking for "' + inputField.value + '"?';
})

function lookForWord(word) {
    // Safely erase all previous results if anythe old data (trust me it only works if I do it the long way :(
    let spelling = document.getElementById("word");
    if (spelling) spelling.textContent = "";

    let pronunciation = document.getElementById("pronunciation");
    if (pronunciation) pronunciation.textContent = "";

    let datasList = document.getElementById("meaningsList");
    if (datasList) datasList.innerHTML = "";

    let synonymList = document.getElementById("synonym-list");
    if (synonymList) synonymList.innerHTML = "";

    let antonymList = document.getElementById("antonym-list");
    if (antonymList) antonymList.innerHTML = "";

    let playButton = document.getElementById("audio-playback-button");
    if (playButton) playButton.innerHTML = "";

    //Now fetch the data from the API

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
            // Safely erase all previous results if anythe old data (trust me it only works if I do it the long way :(
            let spelling = document.getElementById("word");
            if (spelling) spelling.textContent = "";

            let pronunciation = document.getElementById("pronunciation");
            if (pronunciation) pronunciation.textContent = "";

            let datasList = document.getElementById("meaningsList");
            if (datasList) datasList.innerHTML = "";

            let synonymList = document.getElementById("synonym-list");
            if (synonymList) synonymList.innerHTML = "";

            let antonymList = document.getElementById("antonym-list");
            if (antonymList) antonymList.innerHTML = "";

            let playButton = document.getElementById("audio-playback-button");
            if (playButton) playButton.innerHTML = "";

            //Erase any error messages if any and create a new one
            if (errorContainer) {
                errorContainer.innerHTML = "";
                errorContainer.classList.remove("hidden");
                let errorMessage = document.createElement("p");

                errorMessage.textContent = `Sorry! We can't find that😅. Feel free to submit something else`;
                errorContainer.appendChild(errorMessage);

                //Tell me what's wrong on the console
                console.log("There seems to be an error here:", error.message);
            }
        })

}

function discoverInfo(info) {

    //DISPLAYING THE ACTUAL WORD:
    let spelling = document.getElementById("word");
    spelling.textContent = info[0].word;

    //DISPLAYING THE WORD'S PRONUNCIATION OR OTHERWISE AN ERROR MESSAGE:
    const phoneticEntry = info[0].phonetics.find(p => p.text) || info[0];
    let pronunciation = document.getElementById("pronunciation");
    pronunciation.textContent = phoneticEntry.text || "No pronunciation available";


    //DISPLAYING THE WORD'S DEFINITION:
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
    if (failedAudio) failedAudio.textContent = "";

    if (audioURL) {
        //create the playback button if there's audio
        let audioButton = document.createElement("button");

        audioButton.id = "temporary-button";
        audioButton.textContent = "Play Audio";
        playButton.innerHTML = "";
        if (playButton) playButton.appendChild(audioButton);


        //play audio function
        audioButton.onclick = () => {
            let audio = new Audio(audioURL);//newAudio method converts URL to record player
            audio.play();
        }
    }
    else {//If no audio is available, display an error message in place of the button
        if (audioButton) audioButton.style.display = "none";
        failMessage = document.createElement("p");
        failMessage.textContent = "Sorry! There's no audio available for this word."
        if (failedAudio) failedAudio.appendChild(failMessage);
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
        else {
            function showOnce() {//Only show the error message once
                let called = 0;
                return () => {
                    if (called === 0) {
                        noMessage = document.createElement("p");
                        noMessage.textContent = "It seems there aren't any synonyms available for this word.";
                        synonymList.appendChild(noMessage);
                        called++;
                    }
                }
            }
            return showOnce();
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
        else {//Only show the error message once
            function displayOnce() {
                let called = 0;
                return () => {
                    if (called === 0) {
                        nullMessage = document.createElement("p");
                        nullMessage.textContent = "It seems there aren't any antonyms available for this word.";
                        antonymList.appendChild(nullMessage);
                        called++;
                    }
                }
            }
            return displayOnce();
        }
    });


}