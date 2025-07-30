import React from "react";
import {
  Card, Typography, Divider, Input, Button, Checkbox, Select, Form, Space
} from "antd";
import { SettingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

export default function MouseTrapConfigAntD() {
  return (
    <Card style={{ maxWidth: 500, margin: "32px auto", padding: 24 }}>
      <Space align="center">
        <SettingOutlined style={{ fontSize: 32, marginRight: 8 }} />
        <Title level={3}>MouseTrap</Title>
      </Space>
      <Divider />
      <Title level={5}>Status</Title>
      <Text type="secondary">
        MaM Cookie: Missing<br />
        Points: N/A<br />
        VIP Automation: N/A<br />
        <span style={{ color: "#1677ff" }}>Current IP: 97.91.210.200</span><br />
        ASN: N/A<br />
        <em>Please provide your MaM ID in the configuration.</em>
      </Text>
      <Divider />
      <Title level={4}>MouseTrap Configuration</Title>
      <Form layout="vertical">
        <Form.Item label="MaM ID">
          <Input defaultValue="UD2MLEXA9nXZmZT3OKO" />
        </Form.Item>
        <Form.Item label="Session Type">
          <Select defaultValue="ASN Locked">
            <Option value="ASN Locked">ASN Locked</Option>
            <Option value="Open">Open</Option>
          </Select>
        </Form.Item>
        <Form.Item label="MaM IP (override)">
          <Space>
            <Input defaultValue="97.91.210.200" />
            <Button>Use Detected Public IP</Button>
          </Space>
          <Text type="secondary">Detected Public IP: 97.91.210.200</Text>
        </Form.Item>
        <Divider />
        <Title level={4}>Perk Automation Options</Title>
        <Form.Item label="Buffer (points to keep)">
          <Input defaultValue="52000" />
        </Form.Item>
        <Form.Item label="Wedge Hours (frequency)">
          <Input defaultValue="168" />
        </Form.Item>
        <Checkbox>Enable Wedge Auto Purchase</Checkbox><br />
        <Checkbox>Enable VIP Auto Purchase</Checkbox><br />
        <Checkbox>Enable Upload Credit Auto Purchase</Checkbox>
        <Form.Item>
          <Button type="primary">Save</Button>
        </Form.Item>
      </Form>
      <Divider />
      <Title level={4}>Notifications</Title>
      <Text type="secondary">Configure email and webhook notifications here. (Coming soon!)</Text>
    </Card>
  );
}