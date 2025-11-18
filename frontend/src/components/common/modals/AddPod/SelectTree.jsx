// SelectTree.jsx
import React, { useState } from 'react';
import { TreeSelect } from 'antd';

const treeData = [
  {
    value: '선택하세요',
    title: '카테고리',
    children: [
      {
        value: 1,
        title: '스포츠',
        children: [
          { value: 6, title: '축구' },
          { value: 7, title: '농구' },
          { value: 8, title: '러닝' },
        ],
      },
      {
        value: 2,
        title: '문화·예술',
        children: [
          {
            value: 9,
            title: '전시회',
          },
          {
            value: 10,
            title: '공연'
          }
        ],
      },
      {
        value: 3,
        title: '학습·교육',
        children:[
          {
            value: 11, title: '프로그래밍'
          },
          {
            value: 12, title: '외국어'
          }
        ]
      },
      {
        value: 4,
        title: '취미·여가',
        children:[
          {
            value: 13,
            title:'사진'
          },
          {
            value: 14,
            title:'음악'
          }
        ]
      },
      {
        value: 5,
        title: '푸드·요리',
        children:[
          {
            value: 15,
            title:'베이킹'
          },
          {
            value: 16,
            title:'맛집투어'
          }
        ]
      }
    ],
  },
];

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