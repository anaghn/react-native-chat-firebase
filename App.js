// @refresh reset

import React, { useState, useEffect, useCallback } from "react";
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
} from "react-native-gifted-chat";
import { IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-community/async-storage";
import { StyleSheet, TextInput, View, YellowBox, Button } from "react-native";
import * as firebase from "firebase";
import "firebase/firestore";

const firebaseConfig = {
  //Your firebase config here
  apiKey: "AIzaSyB2MIRnmRihMLEFuAKiQ7ttsos79VmhiXg",
  authDomain: "giftedchattest-2052a.firebaseapp.com",
  projectId: "giftedchattest-2052a",
  storageBucket: "giftedchattest-2052a.appspot.com",
  messagingSenderId: "123862528579",
  appId: "1:123862528579:web:6ff17756ceec8a7c1e5af6",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

YellowBox.ignoreWarnings(["Setting a timer for a long period of time"]);

const db = firebase.firestore();
const chatsRef = db.collection("chats");

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          //createdAt is firebase.firestore.Timestamp instance
          //https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
    });
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
    },
    [messages]
  );

  async function readUser() {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  }
  async function handlePress() {
    const _id = Math.random().toString(36).substring(7);
    const user = { _id, name };
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }
  async function handleSend(messages) {
    const writes = messages.map((m) => chatsRef.add(m));
    await Promise.all(writes);
  }

  function renderBubble(props) {
    return (
      // Step 3: return the component
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            // Here is the color change
            backgroundColor: "#BB9E7A",
          },
          left: {
            // Here is the color change
            backgroundColor: "#413D35",
          },
        }}
        textStyle={{
          right: {
            color: "#fff",
          },
          left: {
            color: "#fff",
          },
        }}
      />
    );
  }

  function renderInputToolbar(props) {
    return <InputToolbar {...props} containerStyle={styles.inputToolbar} />;
  }

  function renderSend(props) {
    return (
      <Send {...props} containerStyle={{ borderWidth: 0 }}>
        <View style={styles.sendingContainer}>
          <IconButton icon="send-circle" size={32} color="#BB9E7A" />
        </View>
      </Send>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
        <Button onPress={handlePress} title="Enter the chat" />
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: "#292B29", flex: 1 }}>
      <GiftedChat
        messages={messages}
        user={user}
        onSend={handleSend}
        renderBubble={renderBubble}
        alwaysShowSend
        renderSend={renderSend}
        renderAvatar={null}
        renderInputToolbar={renderInputToolbar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292B29",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  input: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: "gray",
  },
  sendingContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
  },
  inputToolbar: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    borderWidth: 0,
    borderColor: "#413D35",
    borderRadius: 25,
    backgroundColor: "#292B29",
    color: "#fff",
  },
});
