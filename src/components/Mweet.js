import { dbService, storageService } from "fbase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import React, { useState } from "react";

const Mweet = ({ mweetObj, isOwner }) => {
  const [editing, setEditing] = useState(false);
  const [newMweet, setNewMweet] = useState(mweetObj.text);

  const onDeleteClick = async () => {
    const ok = window.confirm("정말로 Mweet을 삭제하시겠습니까?");
    console.log("ok");
    if (ok) {
      //delete mweet
      await deleteDoc(doc(dbService, "mweets", `${mweetObj.id}`));
      await deleteObject(ref(storageService, mweetObj.attchmentURL));
    }
  };

  const toggleEditing = () => setEditing((prev) => !prev);
  const onSubmit = async (event) => {
    event.preventDefault();
    await updateDoc(doc(dbService, "mweets", `${mweetObj.id}`), {
      text: newMweet,
    });
    setEditing(false);
  };
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewMweet(value);
  };

  return (
    <div>
      {editing ? (
        <>
          <form onSubmit={onSubmit}>
            <input
              value={newMweet}
              required
              placeholder="Edit your mweet"
              onChange={onChange}
            />
            <input type="submit" value="Update Mweet" />
          </form>
          <button onClick={toggleEditing}>Cancel</button>
        </>
      ) : (
        <>
          <h4>{mweetObj.text}</h4>
          {mweetObj.attchmentURL && (
            <img src={mweetObj.attchmentURL} width="50px" height="50px" />
          )}
          {isOwner && (
            <>
              <button onClick={onDeleteClick}>Delete Mweet</button>
              <button onClick={toggleEditing}>Edit Mweet</button>
            </>
          )}
        </>
      )}
    </div>
  );
};
export default Mweet;
