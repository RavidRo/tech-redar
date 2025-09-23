import { Tag } from 'antd';
import type React from 'react';
import { generateColorFromString } from '../libraries/colors';

const TechnologyTag: React.FC<{ tag: string }> = ({ tag }) => {
	const color = generateColorFromString(tag);
	return <Tag color={color}>{tag.toUpperCase()}</Tag>;
};

export default TechnologyTag;
