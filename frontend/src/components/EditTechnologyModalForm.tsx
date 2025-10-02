import type { FormProps } from 'antd';
import { Form, Input, Modal, Select } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';
import {
	CATEGORIES,
	STAGES,
	type Category,
	type EditedTechnology,
	type Stage,
	type Technology,
} from '../hooks/useTechnologies';
import TechnologyTag from './TechnologyTag';

const { Option } = Select;

interface EditTechnologyFormProps {
	tags: string[];
	onSave: (technology: EditedTechnology) => void;
}

interface FieldType {
	category: Category;
	stage: Stage;
	transitionAdrLink?: Stage;
	tags?: string[];
	detailsPage?: string | null;
}

export interface EditTechnologyModalFormRef {
	open: (technology: Technology) => void;
}

const EditTechnologyModalForm = forwardRef<EditTechnologyModalFormRef, EditTechnologyFormProps>(
	({ tags, onSave }, ref) => {
		const [form] = Form.useForm<FieldType>();
		const [hasStageChanged, setHasStageChanged] = useState<boolean>(false);
		const [technology, setTechnology] = useState<Technology | null>(null);
		const isOpen = technology !== null;
		const close = () => {
			setTechnology(null);
		};
		const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
			if (technology !== null) {
				onSave({
					name: technology.name,
					category: values.category,
					tags: values.tags ?? [],
					detailsPage: values.detailsPage ?? null,
					stageTransition: values.transitionAdrLink
						? {
								adrLink: values.transitionAdrLink,
								newStage: values.stage,
							}
						: null,
				});
			}
		};
		useImperativeHandle(ref, () => {
			return {
				open: (technology: Technology) => {
					setTechnology(technology);
					form.setFieldsValue({
						category: technology.category,
						stage: technology.stage,
						tags: technology.tags,
						detailsPage: technology.detailsPage,
					});
					setHasStageChanged(false);
				},
			};
		}, [form]);

		return (
			<Modal
				open={isOpen}
				title={technology && `Edit ${technology.name}`}
				okText="Save"
				onOk={() => {
					form.submit();
					close();
				}}
				cancelText="Cancel"
				okButtonProps={{ autoFocus: true }}
				onCancel={close}
				modalRender={(dom) => (
					<Form
						form={form}
						layout="horizontal"
						name="editTechnology"
						onFinish={onFinish}
						autoComplete="off"
						onValuesChange={(_changedValues, values) => {
							setHasStageChanged(values.stage !== technology?.stage);
						}}
					>
						{dom}
					</Form>
				)}
			>
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
					hidden={!hasStageChanged}
					label="Stage Transition ADR Link"
					name="transitionAdrLink"
					rules={[{ required: hasStageChanged, type: 'url' }]}
				>
					<Input />
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
	},
);

export default EditTechnologyModalForm;
