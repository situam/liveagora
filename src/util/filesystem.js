/**
 * Download a textfile
 * - source: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
 * @param {string} filename - e.g. "snapshot.json"
 * @param {string} text - e.g. "plain text content"
 */
export function saveTextFile(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

/** 
 * @callback handleTextCallback
 * @param {string} data The string data to process.
 */

/**
 * 
 * openFileDialogAndReadFile
 * @param {handleTextCallback} onReadCallback - callback function to handle the text data once read
 * @param {string} [accept='.json'] - Specifies the type of files that the user can pick from the file input. Defaults to '.json'.
 */
export function loadTextFile(onReadCallback, accept='.json') {
  // Create an input element
  let inputElement = document.createElement('input');
  inputElement.type = 'file';
  inputElement.accept = '.json'; // Specify that only text files can be selected

  // Listen for file selection
  inputElement.addEventListener('change', function() {
    var file = this.files[0]; // Get the selected file

    if (file) {
      var reader = new FileReader();

      // Define what happens on successful file read
      reader.onload = function(event) {
        onReadCallback(event.target.result)
      };

      // Read the file as text
      reader.readAsText(file);

      // Clean up the input element after reading the file
      inputElement.remove();
    }
  });

  // Simulate a click to open the file dialog
  inputElement.click();
}