import { Select, TextInput } from "@inkjs/ui";
import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink'
import ContainerElement from "./components/welcome.js";
import JoinRoom from "./components/join-room.js";
import ChatView from "./components/chat-view.js";
import { initConfig } from "./utils/config.js";

type Props = {
    name: string | undefined;
};

export default function App({name = 'Stranger'}: Props) {
	const [page, setPage] = useState("welcome");
	const [currentRoom, setCurrentRoom] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		// Initialize config on app startup
		initConfig();
	}, []);

	if(page == "welcome"){
		return (
			<ContainerElement>
				<Select
					options={[
							{label: 'Join Room', value: 'join-room'},
							{label: 'Exit', value: 'exit'}
						]
					}
					onChange={value => {
						if (value === 'join-room') {
							setPage('enter-username');
						} else {
							setPage(value);
						}
					}}
				/>
			</ContainerElement>
		)
	}else if(page == "enter-username"){
		return (
			<Box flexDirection="column">
				<ContainerElement />
				<Box marginTop={1} flexDirection="column">
					<Text>Enter your username</Text>
					<TextInput
						placeholder="Username"
						onSubmit={(value) => {
							if (value.trim()) {
								setUsername(value.trim());
								setPage('join-room');
							}
						}}
					/>
				</Box>
			</Box>
		)
	}else if(page == "join-room"){
		return (
			<Box flexDirection="column">
				<ContainerElement />
				<JoinRoom onComplete={(roomName) => {
					setCurrentRoom(roomName);
					setPage("chat");
				}} />
			</Box>
		)
	}else if(page == "chat" && currentRoom && username){
		return <ChatView
			roomName={currentRoom}
			username={username}
			onExit={() => {
				setPage('welcome');
				setCurrentRoom(null);
				setUsername(null);
			}}
		/>
	}else{
		return (
			<Box flexDirection="column">
				<ContainerElement />
				<Text>See you! ✌️</Text>
			</Box>
		)
	}
}