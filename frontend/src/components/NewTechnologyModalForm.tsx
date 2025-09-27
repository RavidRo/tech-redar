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
	takenNames: string[];
	tags: string[];
	isOpen: boolean;
	closeModal: () => void;
	addTechnology: (technology: Omit<Technology, 'history'>) => void;
}

interface FieldType {
	name: string;
	category: Category;
	stage: Stage;
	tags?: string[];
	detailsPage?: string | null;
}

const NewTechnologyModalForm: React.FC<NewTechnologyFormProps> = ({
	takenNames,
	tags,
	isOpen,
	closeModal,
	addTechnology,
}) => {
	const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
		addTechnology({
			category: values.category,
			name: values.name,
			stage: values.stage,
			tags: values.tags ?? [],
			detailsPage: values.detailsPage ?? null,
		});
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
					autoComplete="off"
				>
					{dom}
				</Form>
			)}
		>
			<Form.Item<FieldType>
				label="Name"
				name="name"
				rules={[
					{ required: true },
					{
						validator: (_rule, value) => {
							if (typeof value !== 'string') {
								throw Error(
									`Expected the value of the name field will be of type 'string' but got ${typeof value}`,
								);
							}
							if (takenNames.includes(value)) {
								return Promise.reject(new Error(`${value} is already on the radar`));
							}
							return Promise.resolve();
						},
					},
				]}
			>
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
				label="Details Page"
				name="detailsPage"
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
							throw Error(`Tag value is expected to be string, ${String(value)}}`);
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
