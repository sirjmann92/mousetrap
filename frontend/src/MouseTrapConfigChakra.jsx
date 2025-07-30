import React from "react";
import {
  Box, Heading, Text, Input, Button, Checkbox, Select, Stack, Container, Flex, Icon
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";

export default function MouseTrapConfigChakra() {
  return (
    <Container maxW="md" mt={8}>
      <Box p={6} borderRadius="md" boxShadow="md" bg="white">
        <Flex align="center" mb={4}>
          <Icon as={SettingsIcon} w={8} h={8} mr={2} />
          <Heading size="lg">MouseTrap</Heading>
        </Flex>
        <Box borderBottom="1px" borderColor="gray.200" mb={4} />
        <Heading size="sm" mb={2}>Status</Heading>
        <Text fontSize="sm" color="gray.600" mb={2}>
          MaM Cookie: Missing<br />
          Points: N/A<br />
          VIP Automation: N/A<br />
          <b>Current IP:</b> 97.91.210.200<br />
          ASN: N/A<br />
          <i>Please provide your MaM ID in the configuration.</i>
        </Text>
        <Box borderBottom="1px" borderColor="gray.200" my={4} />
        <Heading size="md" mb={2}>MouseTrap Configuration</Heading>
        <Stack spacing={3} mb={4}>
          <Input placeholder="MaM ID" defaultValue="UD2MLEXA9nXZmZT3OKO" />
          <Select defaultValue="ASN Locked">
            <option value="ASN Locked">ASN Locked</option>
            <option value="Open">Open</option>
          </Select>
          <Flex>
            <Input placeholder="MaM IP (override)" defaultValue="97.91.210.200" />
            <Button ml={2}>Use Detected Public IP</Button>
          </Flex>
        </Stack>
        <Text fontSize="xs" color="gray.500" mb={2}>Detected Public IP: 97.91.210.200</Text>
        <Box borderBottom="1px" borderColor="gray.200" my={4} />
        <Heading size="md" mb={2}>Perk Automation Options</Heading>
        <Stack spacing={3} mb={4}>
          <Input placeholder="Buffer (points to keep)" defaultValue="52000" />
          <Input placeholder="Wedge Hours (frequency)" defaultValue="168" />
          <Checkbox>Enable Wedge Auto Purchase</Checkbox>
          <Checkbox>Enable VIP Auto Purchase</Checkbox>
          <Checkbox>Enable Upload Credit Auto Purchase</Checkbox>
        </Stack>
        <Button colorScheme="blue" mb={4}>Save</Button>
        <Box borderBottom="1px" borderColor="gray.200" my={4} />
        <Heading size="md" mb={2}>Notifications</Heading>
        <Text fontSize="sm" color="gray.600">
          Configure email and webhook notifications here. (Coming soon!)
        </Text>
      </Box>
    </Container>
  );
}
