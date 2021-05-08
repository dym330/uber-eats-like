// --- ここから追加 ---
import React from 'react';

// style
import { RoundButton } from '../shared_style';

export const CountDownButton = ({
  onClick,
  isDisabled,
}) => (
  <RoundButton onClick={onClick} disabled={isDisabled}>
    ー
  </RoundButton>
)
// --- ここまで追加 ---
