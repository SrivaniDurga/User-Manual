document.addEventListener('DOMContentLoaded', function () {
    let uploadedFile = null;

    const fileInput = document.getElementById('fileInput');
    const reviewContainer = document.getElementById('reviewContainer');
    const viewReviewButton = document.getElementById('viewReviewButton');
    const viewHtmlButton = document.getElementById('viewHtmlButton');
    const viewHtmlScript = document.getElementById('viewHtmlScript');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const historyLink = document.getElementById('historyLink'); // Link to view history

    let isDarkMode = false;

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        uploadedFile = file;

        if (file) {
            const fileType = file.type;
            if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                viewReviewButton.disabled = false;
                reviewContainer.style.display = 'none';
                viewHtmlButton.style.display = 'none';
                viewHtmlScript.style.display = 'none';

                previewDOCX(file, reviewContainer);
                saveUploadHistory(file.name); // Save upload history
            } else {
                viewReviewButton.disabled = true;
                alert('Please upload a DOCX file.');
            }
        }
    });

    function previewDOCX(file, container) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                .then(result => {
                    container.innerHTML = result.value;
                })
                .catch(handleError);
        };
        reader.readAsArrayBuffer(file);
    }

    function handleError(err) {
        console.error('Error processing file:', err);
    }

    viewReviewButton.addEventListener('click', function () {
        reviewContainer.style.display = 'block';
        viewReviewButton.style.display = 'none';
        viewHtmlButton.style.display = 'block';
        viewHtmlScript.style.display = 'block'; // Ensure it's visible when switching to HTML preview
    });

    viewHtmlButton.addEventListener('click', function () {
        const docxContent = reviewContainer.innerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(docxContent, 'text/html');
        const headings = extractHeadings(doc);
        localStorage.setItem('documentHeadings', JSON.stringify(headings));
        window.location.href = 'DoctoHtmlConvertion.html';
    });

    function extractHeadings(doc) {
        const headings = [];
        const allElements = doc.body.children;
        let currentHeading = null;

        Array.from(allElements).forEach(element => {
            if (/^H[1-6]$/.test(element.tagName)) {
                currentHeading = {
                    tagName: element.tagName,
                    text: element.textContent,
                    content: element.outerHTML,
                    relatedContent: ''
                };
                headings.push(currentHeading);
            } else if (currentHeading) {
                currentHeading.relatedContent += element.outerHTML;
            }
        });
        return headings;
    }

    darkModeToggle.addEventListener('click', function () {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            darkModeIcon.classList.remove('fa-moon-o');
            darkModeIcon.classList.add('fa-sun-o');
            body.classList.add('dark-mode');
        } else {
            darkModeIcon.classList.remove('fa-sun-o');
            darkModeIcon.classList.add('fa-moon-o');
            body.classList.remove('dark-mode');
        }
    });

    // Add history link event listener to view upload history
    if (historyLink) {
        historyLink.addEventListener('click', function () {
            window.location.href = 'history.html';
        });
    }

     // Save upload history
     function saveUploadHistory(fileName) {
        const uploadHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
        const currentDate = new Date().toLocaleString();
        uploadHistory.push({ fileName, dateTime: currentDate });
       
    }
});

