const main = () => {
    const dashboardSidebarControlInside = document.querySelector('#dashboard-sidebar-control-inside')
    const dashboardSidebar = document.querySelector('#dashboard-sidebar')
    const dashboardSidebarControl = document.querySelector('#dashboard-sidebar-control')
    const dashboardSidebarBackground = document.querySelector('.dashboard-sidebar-background')
    dashboardSidebar.dataset.open = false;
    const menuToggle = (event) => {
        const self = event.target
        const side = dashboardSidebar;
        const isOpen = side.dataset.open === 'true';
        dashboardSidebar.dataset.open = !isOpen
        self.dataset.open = !isOpen
    }
    dashboardSidebarControlInside.addEventListener('click', menuToggle);
    dashboardSidebarControl.addEventListener('click', menuToggle);
    dashboardSidebarBackground.addEventListener('click', menuToggle);
}

main();

const editorPage = () => {

    const modal = new bootstrap.Modal('#dashbaord-modal-media')
    let lastQuillPosition = 0;
    let targetMediaLibrary = 'editor'

    const editor = () => {
        var quill = new Quill('#editor-container', {
            modules: {
                toolbar: '#toolbar-container',
                imageDropAndPaste: {
                    handler: imageHandler
                },
                imageResize: {
                    displaySize: true
                },
            },
            placeholder: 'Contenido...',
            readOnly: false,
            theme: 'snow'
        })

        function imageHandler(dataUrl, type, imageData) {
            imageData.minify({
                maxWidth: 320,
                maxHeight: 320,
                quality: .7
            }).then((miniImageData) => {
                var blob = miniImageData.toBlob()
                var file = miniImageData.toFile('my_cool_image.png')
                // display preview image from blob url
                var blobUrl = URL.createObjectURL(blob)
                var preivew = document.getElementById('preview')
                var previewImage = document.createElement('img')
                previewImage.src = blobUrl
                previewImage.onload = function () {
                    preview.appendChild(previewImage)
                    preview.style.display = 'block'
                }

                // display file infomation from file object
                var info = document.getElementById('info')
                document.getElementById('file-name').textContent = file.name
                document.getElementById('file-size').textContent = file.size
                document.getElementById('file-type').textContent = file.type
                info.style.display = 'block'
            })
        }

        quill.on('text-change', (delta, oldDelta, source) => {
            document.getElementById("editor-target").value = `${quill.root.innerHTML}` === '<p><br></p>' ? '' : quill.root.innerHTML
        });

        quill.on('selection-change', (delta, oldDelta, source) => {
            if (oldDelta && oldDelta.index !== null) {
                lastQuillPosition = oldDelta.index
            } else {
                lastQuillPosition = 0
            }
        });

        return quill
    }

    const quill = editor();

    const showFiles = async (quill, modal) => {
        const target = document.querySelector('#media')
        target.innerHTML = ''
        const files = await fetch('/api/v1/files')
        const res = await files.json()
        const handleInsert = (event) => {
            const targetInsert = targetMediaLibrary
            const target = event.target
            const src = target.dataset.src
            if (quill) quill.insertEmbed(lastQuillPosition, 'image', src);
            else {
                console.log(src, targetInsert, target.dataset.id)
                const dashbaordModalMediaControl = document.querySelector('#dashboard-thumbnail')
                const dashboardThumbnailInput = document.querySelector('#dashboard-thumbnail-input')
                dashbaordModalMediaControl.style.backgroundImage = `url('${src}')`
                dashboardThumbnailInput.value = target.dataset.id
            }
            modal.hide();
        }

        res.forEach((image) => {
            const media = document.createElement('img')
            media.src = `/media/${image.filename}`
            media.dataset.src = `/media/${image.filename}`
            media.dataset.id = image.id
            media.width = 100
            media.addEventListener('click', handleInsert)
            target.appendChild(media)
        })
    }

    const actionFormUploadMedia = (quill) => {
        const form = document.querySelector('#dashboard-upload-file')
        form.addEventListener('submit', async (event) => {
            event.preventDefault()
            const formData = new FormData();
            const elms = event.target.elements
            formData.append('media', elms['media'].files[0]);

            const response = await fetch('/api/v1/files', {
                method: 'POST',
                body: formData
            });
            try {
                const result = await response.json()
                showFiles(quill, modal).then(() => {
                })
            } catch (error) {

            }
        })
    }
    actionFormUploadMedia(quill)

    const thumbnail = () => {
        const dashbaordModalMediaControl = document.querySelector('#dashboard-thumbnail')
        dashbaordModalMediaControl.addEventListener('click', (event) => {
            showFiles(null, modal).then(() => {
                targetMediaLibrary = 'thumbnail'
                modal.show();
            })
        })
    }

    thumbnail()

    const media = (quill) => {
        const dashbaordModalMediaControl = document.querySelector('#dashbaord-modal-media-control')
        dashbaordModalMediaControl.addEventListener('click', (event) => {
            showFiles(quill, modal).then(() => {
                targetMediaLibrary = 'editor'
                modal.show();
            })
        })
    }
    media(quill);

    const actionSave = () => {
        const title = document.querySelector('#dashboard-input-title')
        const action = document.querySelector('#dashboard-action-save')
        action.addEventListener('submit', async (event) => {
            event.preventDefault()
            const content = quill.root.innerHTML
            const rawResponse = await fetch('/api/v1/posts', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title.value,
                    content,
                    thumbnail: document.querySelector('#dashboard-thumbnail-input').value,
                })
            })
            const result = await rawResponse.json()
            if (result) {
                window.location.href = "/dashboard/posts";
            }
        })
    }

    actionSave()
}


const userForm = () => {
    const actionUserSave = () => {
        const username = document.querySelector('#dashboard-input-username')
        const password = document.querySelector('#dashboard-input-password')
        const action = document.querySelector('#dashboard-action-save')
        action.addEventListener('submit', async (event) => {
            event.preventDefault()
            const rawResponse = await fetch('/api/v1/users', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.value,
                    password: password.value,
                })
            })
            const result = await rawResponse.json()
            if (result) {
                // window.location.href = "/dashboard/posts";
            }
        })
    }

    actionUserSave()
}
