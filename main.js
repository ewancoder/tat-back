document.addEventListener('keydown', processKeyDown);
document.addEventListener('keyup', processKeyUp);

window.signin = async function(response) {
    auth.token = response.credential;
    document.getElementById('authentication').style.display = 'none';

    const text = await getNextText();
    typingState.prepareText(text, textElement);
};

// Authentication token is saved here after authenticating.
const auth = {};

// Element where the text that you're typing is drawn.
const textElement = document.getElementById('text');

// Current typing state object.
const typingState = {
    /* This indicates whether input should be handled. */
    allowInput: false,

    /* This indicates what index is the caret currently on.
     * When Index is 0, it means we need to type the first symbol of the text. */
    index: 0,

    /* Source text value. */
    sourceText: undefined,

    /* Contains complete data of every character of the text, in the format:
     - character (text)
     - currentlyFailed (boolean) - indicates whether this character is currently typed incorrectly
     - failed (boolean) - indicates that this character has been typed incorrectly before
     - span (DOM) - points to the HTML span element that holds this character */
    textToType: [],

    /* Time when the typing has begun. */
    startedTypingAt: undefined,

    /* Performance.now() result when the typing has begun. */
    startedTypingPerf: undefined,

    /* All events that occurred during typing.
     * This is what is being sent to the server to record for statistics, with the following format:
     - key (text) - either a character or a command key like LeftShift, RightShift, Space, Backspace
     - perf (number) - performance.now() result to measure timing of key presses in the most accurate way
     - index (number) - index of the position of the caret during that key press
     - keyAction (text) - can be 'Press' or 'Release' depending on action */
    events: [],

    // Resets the state to default values.
    reset() {
        this.allowInput = false;
        this.index = 0;
        this.sourceText = undefined;
        this.textToType = [];
        this.startedTypingAt = undefined;
        this.startedTypingPerf = undefined;
        this.events = [];
    },

    // Prepares the text and draws it in the textElement field, and allows input.
    prepareText(text, textElement) {
        this.reset();
        this.sourceText = text;

        text.split('').forEach(character => {
            const characterSpan = document.createElement('span');
            characterSpan.innerText = character;
            textElement.appendChild(characterSpan);
            this.textToType.push({
                character: character,
                currentlyFailed: false,
                failed: false,
                span: characterSpan
            });
        });

        // Indicates that everything has been set up and now user input can start to be processed.
        this.allowInput = true;
    },

    startTypingIfNotStarted(key, perf) {
        if (this.startedTypingAt != undefined || (key.length > 1 && key != 'LShift' && key != 'RShift')) return;

        this.startedTypingAt = Date.now();
        this.startedTypingPerf = perf;

        // Place the caret on the first character.
        this.textToType[this.index].span.classList.add('cursor');
    },

    pressKey(key, perf) {
        if (!this.canType()) return;
        this.startTypingIfNotStarted(key, perf);

        this.logCharacterAction(key, perf, 'Press');
    },

    releaseKey(key, perf) {
        if (!this.canType()) return;
        this.startTypingIfNotStarted(key, perf);

        this.logCharacterAction(key, perf, 'Release');
    },

    canType() {
        // Do not log any character presses once the text has been typed in full.
        return this.allowInput;
    },

    logCharacterAction(key, perf, keyAction) {
        this.events.push({
            key: key,
            perf: perf,
            index: this.index,
            keyAction: keyAction
        });

        if (keyAction == 'Release' || (key.length > 1 && key != 'Backspace')) return;

        let currentKey = null;
        let currentSpan = null;

        if (this.index != this.textToType.length) {
            currentKey = this.textToType[this.index];
            currentSpan = currentKey.span;
        }

        if (key == 'Backspace') {
            if (this.index == 0) return;

            if (currentKey != null) {
                // Move caret away.
                currentSpan.classList.remove('cursor');
            }

            this.index--;

            currentKey = this.textToType[this.index];
            currentSpan = currentKey.span;

            currentKey.currentlyFailed = false;
            currentSpan.classList.remove('typed');
            currentSpan.classList.remove('wrong');
            currentSpan.classList.remove('corrected');
            if (currentKey.failed) {
                if (currentKey.character == ' ') {
                    //currentSpan.classList.add('space-was-wrong');
                } else {
                    currentSpan.classList.add('was-wrong');
                }
            }

            currentSpan.classList.add('cursor');
            return;
        }

        if (currentKey == null) return;

        // Move caret away.
        currentSpan.classList.remove('cursor');

        if (currentKey.character != key) {
            currentKey.failed = true;
            currentKey.currentlyFailed = true;
            currentSpan.classList.remove('typed');
            currentSpan.classList.add('wrong');
        } else {
            currentSpan.classList.remove('wrong');
            currentSpan.classList.remove('was-wrong');
            //currentSpan.classList.remove('space-was-wrong');

            if (currentKey.failed) {
                currentSpan.classList.add('corrected');
            } else {
                currentSpan.classList.add('typed');
            }
        }

        this.index++;
        if (this.textToType.length == this.index) {
            this.finishTyping();
            return;
        }

        currentKey = this.textToType[this.index];
        currentSpan = currentKey.span;

        currentSpan.classList.add('cursor');
    },

    finishTyping() {
        if (this.textToType.some(x => x.currentlyFailed)) return;

        this.allowInput = false;
        this.uploadResults({
            text: this.sourceText,
            events: this.events
        });
    },

    uploadResults(results) {
        console.log(results);
    }
};

function processKeyDown(event) {
    const perf = performance.now();
    const key = getKey(event);

    typingState.pressKey(key, perf);
}

function processKeyUp(event) {
    const perf = performance.now();
    const key = getKey(event);

    typingState.releaseKey(key, perf);
}

function getKey(event) {
    if (event.code == 'ShiftLeft') return 'LShift';
    if (event.code == 'ShiftRight') return 'RShift';

    if (event.key.length == 1 || isAllowedControlKey(event.key)) {
        return event.key;
    }

    return null;
}

function isAllowedControlKey(key) {
    return key == 'Backspace';
}

function getNextText() {
    return 'Sample text that you need to type.';
}
