import { useRef, useState } from 'react'
import { pb } from '../services/pocketbase'
import { FileDrop } from 'react-file-drop'
import { formatBytes } from '../util/utils'
import './Uploader.css'

import { compressImageFile } from '../util/compressor'
import { ffmpegService } from '../util/ffmpeg'
import { uploadFormData } from '../util/upload'

import { getUploadUrl } from '../api/getObjectStorageUploadUrl'

export const Uploader = ({onUploaded, isVisible, onClose}) => {
  const fileInputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [numUploaded, setNumUploaded] = useState(0)
  const [total, setTotal] = useState(1)
  const [progressArray, setProgressArray] = useState([]) // keep track of upload progress

  const onSubmit = async (e) => {
    e.preventDefault()

    setTotal(files.length)
    setIsUploading(true)
    console.log("[Uploader] onSubmit", files)

    let nUploaded = 0 

    await Promise.all(
      Array.from(files).map(async (file, idx) => {
        if (file.type.includes('image')) {
          /*
          if (file.size > 5242880 * 2) {
            alert('image upload rejected (file > 10MB)')
            return
          }
          */
          let fileToUpload
          try {
            fileToUpload = await compressImageFile(file)
            console.log("[Uploader:onSubmit] file.size, fileToUpload.size", file.size, fileToUpload.size)
          } catch (err) {
            fileToUpload = file
            console.error(err)
          }

          const res = await fetch(`${import.meta.env.VITE_LIVEAGORA_SERVER_URL}/getImageUploadUrl`);
          if (res.status !== 200) {
            alert(await res.json())
            throw new Error("getUploadUrl failed");
          }

          const data = await res.json();
          const { id, uploadURL } = data.result;
          console.log("[Uploader:onSubmit] id, uploadURL", id, uploadURL)

          const formData = new FormData()
          formData.append("file", fileToUpload, fileToUpload.name);

          try {
            await uploadFormData(
              uploadURL,
              formData,
              (percentComplete) => {
                console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                setProgressArray((prevProgressArray) => {
                  const newProgressArray = [...prevProgressArray]
                  newProgressArray[idx] = percentComplete.toFixed(0)
                  return newProgressArray
                });
              },
              (response) => {
                console.log("Upload successful", response);
              },
              (error) => {
                console.error("Upload failed", error);
              }
            );
          } catch (error) {
            console.error("An error occurred during the upload", error);
          }

          onUploaded('image', {link: `https://imagedelivery.net/B7Du2acbdC64cz50SK5nLg/${id}/public`}, nUploaded++)
          setNumUploaded(nUploaded)
        }

        if (file.type.includes('video')) {
          if (file.size > 200000000) {
            alert('image upload rejected (file > 200MB)')
            return
          }

          const res = await fetch(`${import.meta.env.VITE_LIVEAGORA_SERVER_URL}/getVideoUploadUrl`);
          if (res.status !== 200) {
            alert(await res.json())
            throw new Error("getUploadUrl failed");
          }

          const data = await res.json();
          const { uid, uploadURL } = data.result;

          const formData = new FormData()
          formData.append("file", file, file.name);

          try {
            await uploadFormData(
              uploadURL,
              formData,
              (percentComplete) => {
                console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
                setProgressArray((prevProgressArray) => {
                  const newProgressArray = [...prevProgressArray]
                  newProgressArray[idx] = percentComplete.toFixed(0)
                  return newProgressArray
                });
              },
              (response) => {
                console.log("Upload successful", response);
              },
              (error) => {
                console.error("Upload failed", error);
              }
            );
          } catch (error) {
            console.error("An error occurred during the upload", error);
          }
          
          onUploaded('video', {
            hls: `https://customer-zfntyssyigsp3hnq.cloudflarestream.com/${uid}/manifest/video.m3u8`
          }, nUploaded++)
          setNumUploaded(nUploaded)

          // TODO: subscribe to webhook notification when processing complete (ready to stream)
          // see https://developers.cloudflare.com/stream/manage-video-library/using-webhooks/
        }

        if (file.type.includes('audio')) {
          let mp3Data;

          // Extract the original file name without its extension
          const originalFileName = file.name.replace(/\.[^/.]+$/, "");

          // get upload URL from server
          const uploadUrlRes = await getUploadUrl({
            filename: `${originalFileName}.mp3`
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
          
          try {

            // TODO: track upload progress
            const response = await fetch(decodeURI(uploadUrlRes.uploadUrl), {
              method: 'PUT',
              body: mp3Blob,
              headers: {
                'Content-Type': mp3Blob.type
              }
            })

            console.log("[Uploader:onSubmit] upload response", response)
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

    onClose()
  }
  
  const onFileInputChange = (event) => {
    const { files } = event.target;
    setFiles(files)
    setProgressArray(new Array(files.length).fill(null))
  }

  const onTargetClick = (e) => {
    e.preventDefault()
    fileInputRef.current.click()
  }

  const onDrop = (files, event) => {
    event.preventDefault();
    //console.log(files)
    setFiles(files)
  }

  return (
    <>
      {
        isVisible &&
        <div onClick={e => e.stopPropagation()}>
          <form onSubmit={onSubmit}>
            {
            files.length>0
            ?
            <table style={{tableLayout: 'auto', whiteSpace: 'nowrap', marginBottom: '15px'}}>
              {
              Array.from(files).map(({name, size, type}, idx)=>
                <tr key={idx}>
                  <td>{name}</td>
                  <td>{type}</td>
                  <td>{formatBytes(size)} {(progressArray.length>idx&&progressArray[idx]!==null)?` (${progressArray[idx]}%)`:''}</td>
                </tr>
                )
              }
            </table>
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
                  {files.length>0 && <button type="submit">upload</button>}
                  <button className="btn-secondary" onClick={onClose}>cancel</button>
                </>
            }
          </form>
        </div>
      }
    </>
  )
}
