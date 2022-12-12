import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { dbService, storageService } from "fbase";
import Mweet from "components/Mweet";
import { v4 as uuidv4 } from "uuid";

const Home = ({ userObj }) => {
  const [mweet, setMweet] = useState("");
  const [mweets, setMweets] = useState([]);
  const [attachment, setAttachment] = useState("");
  // 실시간으로 데이터 가져오기
  useEffect(() => {
    const q = query(
      collection(dbService, "mweets"),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      const mweetArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMweets(mweetArr);
    });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    let attchmentURL = "";
    // 사진이 있으면 실행 
    if (attachment != "") {
      const storageRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      await uploadString(storageRef, attachment, "data_url");
      attchmentURL = await getDownloadURL(storageRef);
    }
    await addDoc(collection(dbService, "mweets"), {
      text: mweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      attchmentURL,
    });
    setMweet("");
    setAttachment("");
  };

  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      console.log(finishedEvent);
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };

  const onClearAttachment = () => setAttachment("");

  const onChange = ({ target: { value } }) => {
    setMweet(value);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
          onChange={onChange}
          value={mweet}
        />
        <input type="file" accept="image/*" onChange={onFileChange} />
        <input type="submit" value="Mweet" />
        {attachment && (
          <div>
            <img src={attachment} width="50px" height="50px" />
            <button onClick={onClearAttachment}>Clear</button>
          </div>
        )}
      </form>
      <div>
        {mweets.map((mweet) => (
          <Mweet
            key={mweet.id}
            mweetObj={mweet}
            isOwner={mweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
