const fileInput = document.getElementById('file-input')
    ,popupHeader = document.getElementById('popupHeader')
    ,form = document.getElementById('upload-form')
    ,loader = document.getElementById('loader')
    ,validateFileBtn = document.getElementById('validateFileBtn')
    ,saveValidationResBtn = document.getElementById('saveValidationResBtn')
    ,viewModelBtn = document.getElementById('viewModelBtn')
    ,modelViewerFrame = document.getElementById("modelViewerFrame")
    ,reportViewerFrame = document.getElementById("reportViewerFrame")
    ,docSelect = document.getElementById('docSelect')
    ,validationProfileBox = document.getElementById('validationProfileBox')
    ,validationProfileSelect = document.getElementById('validationProfileSelect')
    ,shaclReportBtn = document.getElementById('shaclReportBtn')
    ,shaclReportTxt = document.getElementById('shaclReportTxt')
    ,val3dityReportBtn = document.getElementById('val3dityReportBtn')
    ,val3dityViewerPanel = document.getElementById('val3dityViewerPanel')
    ,shaclReportBtnArrow = document.getElementById('shaclReportBtnArrow')
    ,val3dityReportBtnArrow = document.getElementById('val3dityReportBtnArrow')
    ,shaclReportTxtZone = document.getElementById('shaclReportTxtZone')
    ,reportZoneHeader = document.getElementById('reportZoneHeader')
    ,reportZoneHeaderTxt = document.getElementById('reportZoneHeaderTxt')
    ,shaclReportIndic = document.getElementById('shaclReportIndic')
    ,val3dityReportIndic = document.getElementById('val3dityReportIndic')
    ,loginModal = document.getElementById('loginModal')
    ,credOkBtn = document.getElementById('credOkBtn')
    ,credCancelBtn = document.getElementById('credCancelBtn')
    ,clientIdTxt = document.getElementById('clientIdTxt')
    ,clientSecretTxt = document.getElementById('clientSecretTxt')
    ,projectList = document.getElementById('projectList')
;

var sessionId;
var docMap = new Map(),
    projMap = new Map(),
    fileMap = new Map(),
    resMap = new Map();


function refreshLoginStatus() {
    // let loginBtn = document.getElementById('loginBtn');
    let loginStatus = document.getElementById('loginStatus');
    loginStatus.value = sessionId ? "VALID SESSION" : "INVALID SESSION";
    loginStatus.style.backgroundColor = sessionId ? "#4caf5070" : "#ff00005c";
    loginStatus.style.textAlign = "center";
    popupHeader.style.display  = sessionId? "none" : "block";
}


function sendDataToViewer(viewerFrame, data, isUrl = false){
    let msg = {}; 
    
    if (isUrl){
       msg = {
            type: "LOAD_MODEL_URL",
            payload: {
                url: data
            }
        };
    }
    else{
        msg = {
            type: "LOAD_MODEL_DATA",
            payload: {
                data: data
            }
        };
    }
    // Send a message to the iframe once it's loaded
    viewerFrame.contentWindow.postMessage(msg, "*");
}

credOkBtn.addEventListener("click", async ()=>{
    if( clientIdTxt.value && clientSecretTxt.value ) {
        loginModal.style.display = "none";
        await loginToBIMServer();
        await getProjects();
    }
})


credCancelBtn.addEventListener("click", ()=>{
    loginModal.style.display = "none";
})




async function loginToBIMServer(){
    const clientId = clientIdTxt.value;
    const clientSecret = clientSecretTxt.value;
 
    const scope = [
        "DATA_USER_READ",
        "PROJECTS_USER_READ",
        "PROJECTS_USER_WRITE",
        "CONTRIBUTIONS_USER_READ",
        "CONTRIBUTIONS_USER_WRITE"
    ];

    try {
        const loginResponse = await fetch('https://apis.bimserver.center/v1/BIMSERVER/LOGIN', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                scope: scope
            })
        });

        const loginData = await loginResponse.json();
        if (loginData.status === "OK") {
            const authWindow = window.open(loginData.url, '_blank', 'width=600,height=400');
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (authWindow.closed) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 1000);
            });

            const sessionTemp = loginData.session_temp;
            const security_id = loginData.security_id;
            const sessionResponse = await fetch(`https://apis.bimserver.center/v1/BIMSERVER/LOGIN/${sessionTemp}?security_id=${security_id}&lang_interface=en`, {
                method: 'GET'
            });
            const sessionData = await sessionResponse.json();

            if (sessionData.status === "OK") {
                sessionId = sessionData.session_id;
                console.log("sessionId = ");
                refreshLoginStatus();
            } else {
                console.error("Error fetching session token:", sessionData.error.message);
            }
        } else {
            console.error("Error logging in:", loginData.error.message);
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}



async function getProjects() {
    try {
        const projectsResponse = await fetch('https://apis.bimserver.center/v1/BIMSERVER/PROJECTS', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionId}`
            }
        });

        const projectsData = await projectsResponse.json();
        if (projectsData.status === "OK") {
            displayProjects(projectsData.records);
        } else {
            console.error("Error fetching projects:", projectsData.error.message);
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}

// function displayProjects(projects) {
//     const projectsDiv = document.getElementById('projectList');
//     projectsDiv.innerHTML = "";
//     // const projListContrib = document.getElementById('projSelect');
//     // projListContrib.innerHTML = "";

//     console.log('Found', projects.length, 'Projects');

//     projects.forEach(project => {

//         // Store project detail in a map for future retrieval
//         projMap.set(project.id, project);

//         const projectElement = document.createElement('div');
//         projectElement.className = 'box';
//         projectElement.innerHTML = `
//             <div class="info-text"><strong>${project.name}</strong></div>
//         `;
//         projectElement.onclick = () => selectProject(projectElement, project.id);
//         projectsDiv.appendChild(projectElement);

//         // const opt = document.createElement('option');
//         // opt.value = project.id;
//         // opt.textContent = project.name;
//         // projListContrib.appendChild(opt);
//     });
// }

function displayProjects(projects) {
    projectList.innerHTML = "";

    console.log('Found', projects.length, 'Projects');

    projects.forEach(project => {
        // Store project detail in a map for future retrieval
        projMap.set(project.id, project);

        const opt = document.createElement('option');
        opt.value = project.id;
        opt.textContent = project.name;
        projectList.appendChild(opt);
    });

    // Optional: set up change event
    projectList.onchange = () => {
        const selectedId = projectList.value;
        selectProject(projectList, selectedId);
    };

    // Select the current value
    selectProject(projectList, projectList.value);
}

function selectProject(element, projectId) {
    deselectAll('projectList');
    element.classList.add('selected');
    getContributions(projectId);
}

async function getContributions(projectId) {
    const contributionsResponse = await fetch(`https://apis.bimserver.center/v1/BIMSERVER/CONTRIBUTIONS?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionId}`
        }
    });

    const contributionsData = await contributionsResponse.json();
    if (contributionsData.status === "OK") {
        displayContributions(contributionsData.records);
    } else {
        console.error("Error fetching contributions:", contributionsData.error.message);
    }
}

// function displayContributions(contributions) {
//     const contributionsDiv = document.getElementById('contributionList');
//     contributionsDiv.innerHTML = "";

//     contributions.forEach(contribution => {
//         const contributionElement = document.createElement('div');
//         contributionElement.className = 'box';
//         contributionElement.innerHTML = `
//             <div class="info-text"><strong>${contribution.name}</strong></div>
//             <p>ID: ${contribution.id}<br>${contribution.description || 'No description available.'}</p>
//         `;
//         contributionElement.onclick = () => selectContribution(contributionElement, contribution.id);
//         contributionsDiv.appendChild(contributionElement);
//     });
// }

function displayContributions(contributions) {
    const contributionSelect = document.getElementById('contributionList');
    contributionSelect.innerHTML = "";

    contributions.forEach(contribution => {
        const opt = document.createElement('option');
        opt.value = contribution.id;
        opt.textContent = `${contribution.name} — ${contribution.description || 'No description'}`;
        contributionSelect.appendChild(opt);
    });

    // Optional: set up change event
    contributionSelect.onchange = () => {
        const selectedId = contributionSelect.value;
        selectContribution(contributionSelect, selectedId);
    };

    // Select the current value
    selectContribution(contributionSelect, contributionSelect.value);
}

async function selectContribution(element, contributionId) {
    deselectAll('contributionList');
    element.classList.add('selected');
    // console.log("Selected Contribution ID:", contributionId);
    // alert(`Selected Contribution ID: ${contributionId}`);
    const contributionResponse = await fetch(`https://apis.bimserver.center/v1/BIMSERVER/contributions/${contributionId}?expand=owner&lang_interface=en`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${sessionId}`
        }
    });
    const contributionFile = await contributionResponse.json();
    const Docs = contributionFile.record.documents
    docMap.clear();
    for (const Doc of Docs) {
        const docId = Doc.id;
        const docResponse = await fetch(`https://apis.bimserver.center/v1/BIMSERVER/documents/${docId}?expand=owner&lang_interface=en`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionId}`
            }
        })
        const docFile = await docResponse.json();
        if (docFile.record.name.endsWith('.json') || docFile.record.name.endsWith('.gml'))
            docMap.set(String(docFile.record.id), docFile.record);

        // console.log(docFile);
        // if (docFile.record.name.endsWith('.ifc')) {
        //     const IFCfileurl = docFile.record.url
        //     downloadAndSubmitIFCFile(IFCfileurl, docFile.record.name);
        //     break;
        // }
    }

    docSelect.innerHTML = "";
    docMap.forEach((doc, docId) => {
        const opt = document.createElement('option');
        opt.value = docId;
        opt.textContent = doc.name;
        docSelect.appendChild(opt);
    });
    if(docMap){
        validateFileBtn.disabled = false;
        saveValidationResBtn.disabled = false;
        saveValidationResBtn.style.color = "white";
    }
}


docSelect.addEventListener("change", ()=>{
    validateFileBtn.disabled = false;
    saveValidationResBtn.disabled = false;
    saveValidationResBtn.style.color = "white";
});


async function downloadAndSubmitIFCFile(url, filename) {
    try {
        // Fetch the IFC file from the URL
        const response = await fetch(url);
        const blob = await response.blob();

        // Create a File object from the blob
        const ifcFile = new File([blob], filename, { type: blob.type });

        // Populate the form's file input with the IFC file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(ifcFile);
        fileInput.files = dataTransfer.files;

        // Submit the form
        form.submit();
    } catch (error) {
        console.error('Failed to download and submit IFC file:', error);
        alert('Failed to submit IFC file');
    }
}
function deselectAll(section) {
    const parentDiv = document.getElementById(section);
    Array.from(parentDiv.getElementsByClassName('box')).forEach(box => box.classList.remove('selected'));
}





// const fileUpload = document.getElementById('fileUpload');
// const fileList = document.getElementById('fileList');

// fileUpload.addEventListener('change', () => {
//     fileMap.clear();
//     fileList.innerHTML = ""; // Clear previous list
//     Array.from(fileUpload.files).forEach(file => {
//         const li = document.createElement('li');
//         li.textContent = file.name;
//         fileList.appendChild(li);

//         fileMap.set(file.name, file);
//     });
// });

async function createProject() {
    let projName = document.getElementById('newProjName').value || "CHEK Validator"
        , projDesc = document.getElementById('newProjDesc').value || "BIM Server project for CHEK Validator."
        ;

    try {
        const projCreaResponse = await fetch('https://apis.bimserver.center/v1/BIMSERVER/projects?lang_interface=en', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionId}`
                , 'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: projName
                , description: projDesc
            })
        });

        const projCreaData = await projCreaResponse.json();
        if (projCreaData.status === "OK") {
            console.log('All good! ->', projCreaData);
        } else {
            console.error("Error logging in:", projCreaData.error.message);
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}



async function createContrib(contribName, contribDesc, fileList, fileContainerMap) {
    // let contribName = document.getElementById('newContribName').value || "CHEK Validator Contrib",
    //     contribDesc = document.getElementById('newContribDesc').value || "Contribution for BIM Server project (CHEK Validator).";

    // const fileListElem = document.getElementById('fileList');
    // const fileList = Array.from(fileListElem.children).map(li => ({
    //     name: li.textContent.trim()
    // }));

    // const jsonString = JSON.stringify(files, null, 2); // pretty-printed
    // console.log(fileList);

    try {
        const contribCreaResponse = await fetch('https://apis.bimserver.center/v1/BIMSERVER/contributions?lang_interface=en', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionId}`
                , 'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: projectList.value
                , name: contribName
                , description: contribDesc
                , documents: fileList
            })
        });

        const contribCreaData = await contribCreaResponse.json();
        if (contribCreaData.status === "OK") {
            console.log('All good! contribCreaData ->', contribCreaData);

            let idx = 0;
            for (const [filename, file] of fileContainerMap) {
                let endpoint = (fileContainerMap.size == idx + 1);
                let url = `${contribCreaData.url}&document_index=${idx}&endpoint=${endpoint}&remove=false`
                console.log(url);
                // Now the contrib should be uploaded throuth the given link
                try {
                    const fileUploadResponse = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${sessionId}`
                            , 'Content-Type': 'application/json'
                        },
                        body: file
                    });

                    const fileUploadData = await fileUploadResponse.json();
                    if (fileUploadData.status === "OK") {
                        console.log('All good! fileUploadData ->', fileUploadData);
                    } else {
                        console.error("Error uploading file:", fileUploadData.error.message);
                    }
                } catch (error) {
                    console.error("Request failed:", error);
                }
                idx++;
            }

            await getProjects();
        }
        else {
            console.error("Error logging in:", contribCreaData.error.message);
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}




async function waitForValidationComplete(jobID) {
    while (true) {
        const response = await fetch(`https://defs-dev.opengis.net/chek-validator/jobs/${jobID}`);
        const data = await response.json();

        if (data.status != "running") {
            console.log("Validation complete!");
            return data;
        }

        // Wait 1 second before next fetch
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}



function setElemValidityClass(elem, isValid){
    if( isValid ){
        elem.classList.add("valid");
        elem.classList.remove("invalid");
    }
    else{
        elem.classList.add("invalid");
        elem.classList.remove("valid");
    }
}

async function validateSelectedFiles() {
    // Get the array of selected files (values)
    const selectedValues = Array.from(docSelect.selectedOptions).map(option => option.value);
    // console.log("selectedValues: ", selectedValues);

    let cityFiles = [];
    let modelToView;

    // download and store each file (document) content for validation 
    for (const val of selectedValues) {
        // if the value exists in the map of document records
        if (docMap.has(val)) {
            console.log(docMap);
            const docVal = docMap.get(val);
            // if its data not downloaded yet
            if (!('strData' in docVal)) {
                // Get the url from the doc record and fetch the (json) file
                await fetch(docVal.url)
                    .then(response => response.json())
                    .then(jsonData => {
                        console.log(`Successfully downloaded ${docVal.name}:`);
                        modelToView = jsonData;

                        const jsonString = JSON.stringify(jsonData);
                        // console.log(jsonString);
                        docVal.strData = jsonString;
                        cityFiles.push({
                            name: docVal.name,
                            data_str: jsonString
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching JSON:', error);
                    });
            }
            else{
                cityFiles.push({
                    name: docVal.name,
                    data_str: docVal.strData
                });
            }
        }
    }

    // Validate the selected files
    if (cityFiles.length > 0) {

        let processId = "_shaclValidation";
        if( validationProfileBox.checked ) processId = validationProfileSelect.value;

        // Validate directly
        const validationInitRes = await fetch(`https://defs-dev.opengis.net/chek-validator/processes/${processId}/execution`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    shacl: "",
                    cityFiles: cityFiles
                }
            })
        });

        const validationInitData = await validationInitRes.json();
        if (validationInitData.status === "accepted") {
            const jobID = validationInitData.jobID;
            let validationStatusRes = await waitForValidationComplete(jobID);

            const validationRes = await fetch(`https://defs-dev.opengis.net/chek-validator/jobs/${jobID}/results`);
            const validationResData = await validationRes.json();

            // display in viewer
            // modelViewerFrame.contentWindow.loadModelFromData(modelToView);
            // console.log("modelToView:", modelToView);
            sendDataToViewer(modelViewerFrame, modelToView);

            // Report
            if( "valid" in validationResData ){
                setElemValidityClass( reportZoneHeader, validationResData.valid );
                reportZoneHeaderTxt.innerText = validationResData.valid? "Valid model" : "Errors in model";
            }

            // SHACL
            shaclReportTxt.innerHTML = "";
            if( validationResData?.shaclReport && "conforms" in validationResData.shaclReport ){
                setElemValidityClass( shaclReportIndic, validationResData.shaclReport.conforms );
                // console.log( "validationReport shacl", validationResData.shaclReport );
                // console.log( "validationReport result:", validationResData.shaclReport.result );
                // console.log( "validationReport result length:", validationResData.shaclReport.result.length );
                if( validationResData.shaclReport.conforms ){
                    shaclReportTxt.innerHTML = "No SHACL error.";
                }
                else if( validationResData.shaclReport?.result && validationResData.shaclReport.result.length > 0){
                    let res = validationResData.shaclReport.result;
                    
                    // Grouping same error 
                    let sameError = new Map();
                    for( let i=0; i<res.length; i++ ){
                        let errorMsg = res[i].resultMessage;
                        if (sameError.has( errorMsg )){
                            let oldVal = sameError.get(errorMsg);
                            oldVal.count++;
                        }
                        else{
                            sameError.set(errorMsg, {
                                res: res[i], 
                                count: 1
                            });
                        }
                    }


                    sameError.forEach((val, key)=>{
                        let groupSize = val.count > 1? `(x${val.count})` : "";
                        let value = (typeof val.res.value === "object")? "" : `| value: ${val.res.value || "unknow"}`;

                        if( "@type" in val.res && val.res["@type"] === "ValidationResult" ){
                            const li = document.createElement("li");
                            li.innerHTML = `<li>
                                <b>${val.res.resultMessage || "unknow"} ${groupSize}</b>
                                <label>(${val.res.sourceShape["@id"] || "unknow"} ${value})</label>
                                <hr>
                            </li>`;
                            shaclReportTxt.appendChild(li);
                        }
                    });


                    // for( let i=0; i<res.length; i++ ){
                    //     // console.log(res[i]);
                    //     let line = i < (res.length-1)? "<hr>" : "";
                    //     if( "@type" in res[i] && res[i]["@type"] === "ValidationResult" ){
                    //         const li = document.createElement("li");
                    //         li.innerHTML = `<li>
                    //             <b>${res[i].resultMessage || "unknow"}</b>
                    //             <label>(${res[i].sourceShape["@id"] || "unknow"}, value: ${res[i].value || "unknow"})</label>
                    //             ${line}
                    //         </li>`;
                    //         shaclReportTxt.appendChild(li);
                    //     }
                    // }
                }
            }


            // val3dity
            if( "val3dityResult" in validationResData ){
                setElemValidityClass( val3dityReportIndic, validationResData.val3dityResult );
            }
            let val3dityReport = validationResData?.fileValidation?.[0]?.val3dityReport;
            if( val3dityReport ) reportViewerFrame.contentWindow.setVald3dityReportData(val3dityReport);            


            let finalRes = JSON.stringify(validationResData, null, 2);
            // document.getElementById("validationResJson").value = finalRes;
            
            let resName = "validation_" + Date.now();
            resMap.set(resName, finalRes);
        }
    }
    else{
        // Manual file loading
        console.log("Manual file loading...");
        sendDataToViewer(modelViewerFrame, "../../testData/ok-buildings-lod012.json", true);
        reportViewerFrame.contentWindow.loadReportFromUrl("../../testData/validation_1751615294669_val3dityPart.json");
    }
}




document.getElementById('loginBtn').addEventListener('click', async function () {
    // await loginToBIMServer();
    // await getProjects();
    loginModal.style.display = "flex";
});

document.getElementById('updateProjListBtn').addEventListener('click', async function () {
    await getProjects();
});

validationProfileBox.addEventListener('change', function () {
    validationProfileSelect.disabled = !validationProfileBox.checked;
});

val3dityReportBtn.addEventListener('click', function () {
    val3dityViewerPanel.classList.toggle("wrapped");
    val3dityReportBtnArrow.textContent = val3dityViewerPanel.classList.contains( "wrapped" )? "v" : ">";
});


shaclReportBtn.addEventListener('click', function () {
    shaclReportTxtZone.classList.toggle("wrapped");
    shaclReportBtnArrow.textContent = shaclReportTxtZone.classList.contains( "wrapped" )? "v" : ">";
});

// document.getElementById('newProjBtn').addEventListener('click', async function () {
//     await createProject();
// });


// document.getElementById('newContribBtn').addEventListener('click', async function () {
//     let contribName = document.getElementById('newContribName').value || "CHEK Validator Contrib",
//         contribDesc = document.getElementById('newContribDesc').value || "Contribution for BIM Server project (CHEK Validator).";

//     const fileListElem = document.getElementById('fileList');
//     const fileList = Array.from(fileListElem.children).map(li => ({
//         name: li.textContent.trim()
//     }));

//     await createContrib(contribName, contribDesc, fileList, fileMap);
// });


validateFileBtn.addEventListener('click', async function (e) {

    const validateFileBtnTxt = document.getElementById('validateFileBtnTxt');

    // // console.log(docMap.get(docSelect.value))

    validateFileBtn.disabled = true;
    saveValidationResBtn.disabled = true;
    validateFileBtnTxt.style.display = "none";
    
    loader.style.display = 'block';
    await validateSelectedFiles();
    
    loader.style.display = 'none';
    validateFileBtnTxt.style.display = "block";

    validateFileBtn.disabled = false;
    saveValidationResBtn.disabled = false;
    validateFileBtnTxt.innerText = "Validate";
});



saveValidationResBtn.addEventListener('click', async function () {
    let contribName = resMap.entries().next().value[0]; //name of the validation (key of the map)
    let fileList = new Array({
        name: contribName + ".json"
    });

    let d = new Date(Number(contribName.split("_")[1]));
    let contribDesc = "Run on " + d.toLocaleString();

    await createContrib(contribName, contribDesc, fileList, resMap);
});


// viewModelBtn.addEventListener('click', async function () {
//     const selectedValues = Array.from(docSelect.selectedOptions).map(option => option.value);

//     // download and store each file (document) content for validation 
//     for (const val of selectedValues) {
//         // if the value exists in the map of document records
//         if (docMap.has(val)) {
//             // if its data not downloaded yet
//             if (!('strData' in docMap.get(val))) {
//                 // Get the url from the doc record and fetch the (json) file
//                 const docVal = docMap.get(val);
//                 // console.log(docVal);

//                 // const msg = {
//                 //     type: "LOAD_MODEL_URL",
//                 //     url: docVal.url
//                 // };
//                 // // Send a message to the iframe once it's loaded
//                 // modelViewerFrame.contentWindow.postMessage(msg, "*");

//                 // modelViewerFrame.contentWindow.loadModelFromUrl(docVal.url);
//                 sendDataToViewer(modelViewerFrame, docVal.url, true);
//             }
//             // process the first selected file only
//             break;
//         }
//     }
// });





refreshLoginStatus();