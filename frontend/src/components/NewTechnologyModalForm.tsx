import type { FormProps } from 'antd';
import { Form, Input, Modal, Select } from 'antd';
import React from 'react';
import {
	CATEGORIES,
	STAGES,
	type Category,
	type Stage,
	type Technology,
} from '../hooks/useTechnologies';
import TechnologyTag from './TechnologyTag';

const { Option } = Select;

interface NewTechnologyFormProps {
	tags: string[];
	isOpen: boolean;
	closeModal: () => void;
	addTechnology: (technology: Omit<Technology, 'history'>, adrLink?: string) => void;
}

interface FieldType {
	name: string;
	category: Category;
	stage: Stage;
	tags: string[];
	adrLink?: string;
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
	console.log('Failed:', errorInfo);
};

const NewTechnologyModalForm: React.FC<NewTechnologyFormProps> = ({
	tags,
	isOpen,
	closeModal,
	addTechnology,
}) => {
	const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
		addTechnology(
			{
				key: values.name, // TODO: Make sure this is unique
				category: values.category,
				name: values.name,
				stage: values.stage,
				tags: values.tags,
			},
			values.adrLink,
		);
		closeModal();
	};
	return (
		<Modal
			open={isOpen}
			title="Add a New Technology"
			okText="Add"
			cancelText="Cancel"
			okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
			onCancel={closeModal}
			destroyOnHidden
			modalRender={(dom) => (
				<Form
					layout="horizontal"
					name="newTechnology"
					clearOnDestroy
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					autoComplete="off"
				>
					{dom}
				</Form>
			)}
		>
			<Form.Item<FieldType> label="Name" name="name" rules={[{ required: true }]}>
				<Input />
			</Form.Item>
			<Form.Item name="category" label="Category" rules={[{ required: true }]}>
				<Select allowClear>
					{CATEGORIES.map((category) => (
						<Option value={category}>{category}</Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item name="stage" label="Stage" rules={[{ required: true }]}>
				<Select allowClear>
					{STAGES.map((stage) => (
						<Option value={stage}>{stage}</Option>
					))}
				</Select>
			</Form.Item>
			<Form.Item<FieldType>
				label="ADR Link"
				name="adrLink"
				rules={[{ required: false, type: 'url' }]}
			>
				<Input />
			</Form.Item>
			<Form.Item name="tags" label="Tags" rules={[{ type: 'array' }]}>
				<Select
					mode="tags"
					tagRender={({ value }) => {
						if (value === undefined) return <></>;
						if (typeof value !== 'string') {
							throw Error(`Tag value is expected to be string, ${value}}`);
						}
						return <TechnologyTag key={value} tag={value} />;
					}}
				>
					{tags.map((tag) => (
						<Option key={tag} value={tag}>
							{tag.toUpperCase()}
						</Option>
					))}
				</Select>
			</Form.Item>
		</Modal>
	);
};

export default NewTechnologyModalForm;
