import { useRef, useState } from 'react'
import { FileDrop } from 'react-file-drop'
import { formatBytes } from '../util/utils'
import './Uploader.css'

import { ffmpegService } from '../util/ffmpeg'

import { getUploadUrl } from '../api/getObjectStorageUploadUrl'
import { createVideoUpload } from '../api/createVideoUpload'
import * as tus from 'tus-js-client'
import { putWithProgress } from '../util/upload'
import { Env } from '../config/env'
import { uploadImage } from '../lib/upload'

export const Uploader = ({onUploaded, onClose}) => {
  const fileInputRef = useRef(null)
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [numUploaded, setNumUploaded] = useState(0)
  const [total, setTotal] = useState(1)
  const [progressArray, setProgressArray] = useState([]) // keep track of upload progress
  const [compressedArray, setCompressedArray] = useState([]) // keep track of compressed size
  const [uploadAsImagesNode, setUploadAsImagesNode] = useState(false)

  const resetState = () => {
    setFiles([])
    setIsUploading(false)
    setNumUploaded(0)
    setTotal(1)
    setProgressArray([])
    setCompressedArray([])
    setUploadAsImagesNode(false)
  }

  const handleClose = () => {
    onClose()
    resetState()
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (files.length === 0) return

    setTotal(files.length)
    setIsUploading(true)
    console.log("[Uploader] onSubmit", files)

    let nUploaded = 0 

    if (uploadAsImagesNode) {
      const imageFiles = files.filter(f => f.type.includes('image'))
      if (imageFiles.length === 0) {
        alert("No image files selected for ImagesNode upload")
      } else {
        const urls = await Promise.all(
          imageFiles.map(async (file, idx) => {
            const url = await uploadImage(file, {
              onSize: (size) => setCompressedArray((prev) => {
                const next = [...prev]
                next[idx] = size
                return next
              }),
              onProgress: (percent) => setProgressArray((prev) => {
                const next = [...prev]
                next[idx] = percent.toFixed(2)
                return next
              }),
            })
            setNumUploaded(nUploaded++)
            return url
          })
        )

        // todo: type this
        const imagesNodeData = {
          links: urls
        }
        
        onUploaded('images', imagesNodeData, 0)
      }

      handleClose()
      return
    }

    await Promise.all(
      files.map(async (file, idx) => {
        if (file.type.includes('image')) {
          try {
            const url = await uploadImage(file, {
              onSize: (size) => setCompressedArray((prev) => {
                const next = [...prev]
                next[idx] = size
                return next
              }),
              onProgress: (percent) => setProgressArray((prev) => {
                const next = [...prev]
                next[idx] = percent.toFixed(2)
                return next
              })
            })
            onUploaded('image', {
              link: url
            }, nUploaded++)
            setNumUploaded(nUploaded)
          } catch (error) {
            console.error("An error occurred during the upload", error);
          }
        }

        if (file.type.includes('video')) {
          if (file.size > 200000000) {
            alert('video upload rejected (file > 200MB)')
            return
          }

          try {
            const videoUpload = await createVideoUpload(file.name)

            await new Promise((resolve, reject) => {
              var upload = new tus.Upload(file, {
                endpoint: videoUpload.tus.endpoint,
                headers: videoUpload.tus.headers,
                metadata: {
                    filename: file.name,
                    filetype: file.type,
                    title: videoUpload.tus.metadata.title
                },
                onSuccess: resolve,
                onError: reject,
                onProgress: function (bytesUploaded, bytesTotal) { 
                  const percentComplete = (bytesUploaded / bytesTotal) * 100;
                  console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                  setProgressArray((prevProgressArray) => {
                    const newProgressArray = [...prevProgressArray]
                    newProgressArray[idx] = percentComplete.toFixed(0)
                    return newProgressArray
                  });
                }
              })

              upload.start()
            })
          
            onUploaded('video', {
              hls: videoUpload.hlsUrl
            }, nUploaded++)
            setNumUploaded(nUploaded)
            // TODO: subscribe to webhook notification when processing complete (ready to stream)
          } catch (error) {
            console.error("An error occurred during the upload", error);
          }
        }

        if (file.type.includes('audio')) {
          let mp3Data;

          // Extract the original file name without its extension
          const originalFileName = file.name.replace(/\.[^/.]+$/, "");

          // get upload URL from server
          const uploadUrlRes = await getUploadUrl({
            filename: `${originalFileName}.mp3`,
            contentType: 'audio/mpeg',
          });
          if (!uploadUrlRes) {
            alert(`Error getting upload URL for ${file.name}`)
            throw new Error("getUploadUrl failed")
          }

          // transcode to mp3 if needed
          if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
              mp3Data = new Uint8Array(await file.arrayBuffer());
          } else {
              // TODO: show transcoding progress
              mp3Data = await ffmpegService.transcodeToMp3(file);
          }

          const mp3Blob = new Blob([mp3Data], { type: 'audio/mpeg' });
          setCompressedArray((prev) => {
            const next = [...prev]
            next[idx] = mp3Blob.size
            return next
          })

          try {
            await putWithProgress(decodeURI(uploadUrlRes.uploadUrl), {
              body: mp3Blob,
              headers: {
                'Content-Type': mp3Blob.type,
              },
              onProgress: (percent) => {
                setProgressArray((prev) => {
                  const next = [...prev]
                  next[idx] = percent.toFixed(2)
                  return next
                })
              }
            })
            onUploaded('sound', {
              link: uploadUrlRes.objectUrl,
              title: file.name // default metadata
            }, nUploaded++)
            setNumUploaded(nUploaded)
          } catch (error) {
            console.error("An error occurred during the upload", error);
          }
        }
      }
    ))

    handleClose()
  }
  
  const onFileInputChange = (event) => {
    const { files } = event.target;
    setFiles(Array.from(files))
    setProgressArray(new Array(files.length).fill(null))
    setCompressedArray(new Array(files.length).fill(null))
  }

  const onTargetClick = (e) => {
    e.preventDefault()
    fileInputRef.current.click()
  }

  const onDrop = (files, event) => {
    event.preventDefault();
    //console.log(files)
    setFiles(Array.from(files))
    setProgressArray(new Array(files.length).fill(null))
    setCompressedArray(new Array(files.length).fill(null))
  }

  return (
          <form onSubmit={onSubmit}>
            {
            files.length>0
            ?
            <div style={{
              maxWidth: '100%',
              overflow: 'auto'
            }}>
            <table style={{tableLayout: 'auto', whiteSpace: 'nowrap', marginBottom: '15px'}}>
              <thead>
                <tr>
                  <td>filename</td>
                  <td>original</td>
                  <td>compressed</td>
                  <td>progress</td>
                </tr>
              </thead>
              <tbody>
              {
              files.map(({name, size, type}, idx)=>
                <tr key={idx}>
                  <td>{name}</td>
                  <td>{formatBytes(size)}</td>
                  <td>{(compressedArray.length>idx&&compressedArray[idx]!==null)?formatBytes(compressedArray[idx]):''}</td>
                  <td>{(progressArray.length>idx&&progressArray[idx]!==null)?`${progressArray[idx]}%`:''}</td>
                </tr>
                )
              }
              </tbody>
            </table>
            </div>
            :
            <FileDrop onTargetClick={onTargetClick} onDrop={onDrop}>
              <button>select an image/video/sound</button>or drag and drop here
            </FileDrop>
            }
            <input style={{display:'none'}} onChange={onFileInputChange} ref={fileInputRef} type="file" name="file" accept="image/*,video/*,audio/*" multiple="multiple"/>
            {
              isUploading ?
                <pre>Uploading... ({numUploaded}/{total})</pre>
              :
                <>
                  {
                    Env.experimentalImagesNode &&
                    <label>
                      <input
                        type="checkbox"
                        checked={uploadAsImagesNode}
                        onChange={(e) => setUploadAsImagesNode(e.target.checked)}
                      />
                      Upload as ImagesNode
                    </label>
                  }
                  {files.length>0 && <button type="submit">upload</button>}
                  <button className="btn-secondary" onClick={handleClose}>cancel</button>
                </>
            }
          </form>
  )
}
