import {Box, Text} from 'ink';
import { TextInput } from "@inkjs/ui";
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore - relayx-js doesn't ship with type definitions
import { Realtime, CONNECTED, RECONNECT, DISCONNECTED } from 'relayx-js';
import { getConfig } from '../utils/config.js';
import ContainerElement from './welcome.js';

type Message = {
    id: string;
    username: string;
    text: string;
    timestamp: string;
};

type ChatViewProps = {
    roomName: string;
    username: string;
    onExit: () => void;
};

function ChatView({ roomName, username, onExit }: ChatViewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'reconnecting'>('connecting');
    const [error, setError] = useState<string | null>(null);
    const [inputKey, setInputKey] = useState(0);
    const clientRef = useRef<any>(null);

    useEffect(() => {
        const connectToRelayX = async () => {
            try {
                const config = getConfig();

                if (!config.api_key || !config.secret) {
                    setError('API credentials not configured. Please add your API key and secret to data/config.json');
                    setConnectionStatus('disconnected');
                    return;
                }

                const client = new Realtime({
                    api_key: config.api_key,
                    secret: config.secret
                });

                // Set up connection listeners
                await client.on(CONNECTED, (status: boolean) => {
                    if (status) {
                        setConnectionStatus('connected');
                        setError(null);
                    } else {
                        setError('Authentication failure - check your API credentials');
                        setConnectionStatus('disconnected');
                    }
                });

                await client.on(RECONNECT, (status: string) => {
                    console.log(status)
                    if (status === "RECONNECTING") {
                        setConnectionStatus('reconnecting');
                    } else if (status === "RECONNECTED") {
                        setConnectionStatus('connected');
                        setError(null);
                    } else if (status === "RECONN_FAIL") {
                        setConnectionStatus('disconnected');
                        setError('Failed to reconnect to RelayX');
                    }
                });

                await client.on(DISCONNECTED, () => {
                    setConnectionStatus('disconnected');
                });

                await client.init({});
                await client.connect();

                clientRef.current = client;

                // Subscribe to the room
                await client.on(`chat.${roomName}`, (msg: any) => {
                    const newMessage: Message = {
                        id: `${msg.data.username}-${Date.now()}`,
                        username: msg.data.username,
                        text: msg.data.text,
                        timestamp: new Date(msg.data.timestamp).toLocaleTimeString()
                    };
                    setMessages(prev => [...prev, newMessage]);
                });

            } catch (err) {
                setError(`Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`);
                setConnectionStatus('disconnected');
            }
        };

        connectToRelayX();

        return () => {
            if (clientRef.current) {
                clientRef.current.close?.();
            }
        };
    }, [roomName]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !username) return;

        // Check if user wants to close connection
        if (text.trim() === '/close') {
            if (clientRef.current) {
                clientRef.current.close();
            }
            onExit();
            return;
        }

        if (!clientRef.current) return;

        try {
            await clientRef.current.publish(`chat.${roomName}`, {
                username: username,
                text: text.trim(),
                timestamp: new Date().toISOString()
            });
            // Clear input by forcing remount with new key
            setInputKey(prev => prev + 1);
        } catch (err) {
            setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'green';
            case 'reconnecting': return 'yellow';
            case 'connecting': return 'yellow';
            case 'disconnected': return 'red';
            default: return 'gray';
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return '● Connected';
            case 'reconnecting': return '◐ Reconnecting...';
            case 'connecting': return '◐ Connecting...';
            case 'disconnected': return '○ Disconnected';
            default: return '○ Unknown';
        }
    };

    return (
        <Box flexDirection="column" height="100%">
            <ContainerElement>
                <Box flexDirection="column" gap={1}>
                    <Text bold color="cyan">Room: {roomName}</Text>
                    <Text>
                        Status: {' '}
                        <Text color={getConnectionStatusColor()}>
                            {getConnectionStatusText()}
                        </Text>
                    </Text>
                </Box>
            </ContainerElement>

            {error && (
                <Box marginTop={1} borderStyle="round" borderColor="red" paddingX={1}>
                    <Text color="red">✖ {error}</Text>
                </Box>
            )}

            <Box flexDirection="column" marginTop={1} flexGrow={1}>
                <Box borderStyle="single" borderColor="gray" flexDirection="column" paddingX={1} paddingY={1} height={20}>
                    {messages.length === 0 ? (
                        <Text dimColor>No messages yet. Start the conversation!</Text>
                    ) : (
                        messages.map(msg => {
                            const isMyMessage = msg.username === username;
                            return (
                                <Box key={msg.id} flexDirection="column" marginBottom={1}>
                                    <Box justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}>
                                        <Box flexDirection="column">
                                            <Box>
                                                <Text bold color={isMyMessage ? 'cyan' : 'magenta'}>
                                                    {msg.username}
                                                </Text>
                                                <Text dimColor> • {msg.timestamp}</Text>
                                            </Box>
                                            <Text>{msg.text}</Text>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })
                    )}
                </Box>

                <Box marginTop={1}>
                    <TextInput
                        key={inputKey}
                        placeholder="Type your message..."
                        onSubmit={handleSendMessage}
                        isDisabled={connectionStatus !== 'connected'}
                    />
                </Box>

                <Box marginTop={1}>
                    <Text dimColor>Press Enter to send • Type /close to exit chat • Ctrl+C to quit app</Text>
                </Box>
            </Box>
        </Box>
    );
}

export default ChatView;
