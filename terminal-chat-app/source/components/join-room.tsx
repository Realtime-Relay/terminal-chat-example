import {Box, Text} from 'ink';
import { TextInput } from "@inkjs/ui";
import React, { useState } from 'react';

type JoinRoomProps = {
    onComplete: (roomName: string) => void;
};

function JoinRoom({ onComplete }: JoinRoomProps) {
    const [error, setError] = useState<string | null>(null);

    const validateRoomName = (name: string): boolean => {
        // Check if lowercase alphanumeric only
        const regex = /^[a-z0-9]+$/;
        return regex.test(name);
    };

    const handleSubmit = (roomName: string) => {
        if (!roomName.trim()) {
            setError('Room name cannot be empty');
            return;
        }

        if (!validateRoomName(roomName)) {
            setError('Room name must be lowercase alphanumeric only (a-z, 0-9)');
            return;
        }

        setError(null);
        onComplete(roomName);
    };

    const handleChange = (newValue: string) => {
        // Validate as user types
        if (newValue.length > 0 && !validateRoomName(newValue)) {
            setError('Room name must be lowercase alphanumeric only (a-z, 0-9)');
        } else {
            setError(null);
        }
    };

    return (
        <Box flexDirection="column" marginTop={1}>
            <Text color="#16c127ff">Join a Room</Text>

            <Box>
                <TextInput
                    placeholder="Enter room name to join (lowercase letters and numbers only)"
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                />
            </Box>

            {error && (
                <Box marginTop={1}>
                    <Text color="red">✖ {error}</Text>
                </Box>
            )}
        </Box>
    );
}

export default JoinRoom;
