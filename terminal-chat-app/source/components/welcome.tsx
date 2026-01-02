import {Box, Text} from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import React from 'react';

function ContainerElement({children}: {children?: any}) {
    return (
        <Box flexDirection="row" gap={5}>
            <Box flexDirection="column" width={'70%'}>
                <Gradient name="retro">
                    <BigText text="Relay" />
                </Gradient>

                <Text color="#e78618ff">A chat application powered by relayX Pub / Sub</Text>
                <Text>More at relay-x.io</Text>
            </Box>
            {children && <Box justifyContent="center" flexDirection="column">
                {children}
            </Box>}
        </Box>
    );
}

export default ContainerElement;