import { useQuery, useMutation, useSubscription } from "@apollo/react-hooks";
import React from 'react';
import { messagesQuery, addMessageMutation, messageAddedSubscription } from './graphql/queries';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

const Chat = ({user}) => {
  // useQuery resembles [result, setResult]
  // then does client.query with messagesQuery and setResult()
  const {data} = useQuery(messagesQuery);
  const messages = data ? data.messages : [];

  // Use ApolloClient's cache as single source of truth for data in client
  useSubscription(messageAddedSubscription, {
    onSubscriptionData: ({client, subscriptionData}) => {
      // Store updated messages in ApolloClient's cache
      // (This allows us to manage state locally)
      client.writeData({data: {
        messages: messages.concat(subscriptionData.data.messageAdded)
      }});

      // After writing to cache, components will be re-rendered
      // and useQuery will return updated messages
    }
  });
  // useMutation returns a function that enables mutation later
  const [addMessage] = useMutation(addMessageMutation);

  const handleSend = async (text) => {
    await addMessage({
      variables: {
        input: {text}
      }
    });
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Chatting as {user}</h1>
        <MessageList user={user} messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </section>
  );
}

export default Chat;
