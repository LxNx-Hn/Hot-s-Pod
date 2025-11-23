// SelectTree.jsx
import React, { useState } from 'react';
import { TreeSelect } from 'antd';
import { treeData } from '../../../../data/categories';

export default function SelectTree({ 
  name,
  value,
  onChange,
  placeholder,
  status,
  className
 }) {
  return (
    <TreeSelect
      showSearch
      style={{ width: '100%' }}
      value={value}
      treeData={treeData}
      placeholder={placeholder}
      status={status}
      className={className}
      allowClear
      treeDefaultExpandAll
      onChange={onChange}
      getPopupContainer={(triggerNode) => triggerNode.parentElement}
      styles={{ popup: { root: { maxHeight: 400, overflow: 'auto' } } }}
    />
  );
}