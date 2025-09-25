import type React from 'react';

interface ErrorBoxProps {
	errorMessage: string;
	error: Error;
}

const ErrorBox: React.FC<ErrorBoxProps> = ({ errorMessage, error }) => {
	return (
		<div
			style={{
				overflow: 'auto',
				background: '#2d2d2d',
				color: '#f5f5f5',
				fontSize: '0.85rem',
				borderRadius: '10px',
				padding: '16px',
				textAlign: 'left',
				maxWidth: '1000px',
				lineHeight: 1,
			}}
		>
			<h4>{errorMessage}</h4>
			<pre
				style={{
					whiteSpace: 'pre-wrap',
					wordBreak: 'break-word',
					margin: 0,
					maxHeight: '300px',
					fontFamily: 'monospace',
				}}
			>
				{String(error)}
			</pre>
		</div>
	);
};

export default ErrorBox;
