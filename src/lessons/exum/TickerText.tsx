import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useRerender } from "../../hooks/useRerender";

const DEFAULT_TIME_FOR_LETTER_MS = 60;
const DEFAULT_BLINK_SPEED_MS = 450;

const DEFAULT_TOKEN_BUFFER = 60;

interface ITickerTextProps {
  text: string; // TODO: Generalize to token based / i.e. support react components?
  timeForLetterMs?: number;
  blinkSpeedMs?: number;
  enableBlink?: boolean;
  onComplete?: () => void;
  // Mini-hack, wait until 2 bonus tokens are added before firing onComplete
  // Otherwise change is too sudden
  tokenBuffer?: number;
}

const BlinkingSpan = styled.span<{blinking: boolean}>`

${({blinking}) => blinking ? `

  &:after {
    content: "_";
    position: absolute;
  }
` : ''}
`

export function TickerText({
  text,
  timeForLetterMs = DEFAULT_TIME_FOR_LETTER_MS,
  blinkSpeedMs = DEFAULT_BLINK_SPEED_MS,
  enableBlink = true,
  onComplete,
  tokenBuffer = DEFAULT_TOKEN_BUFFER,
}: ITickerTextProps) {
  const [letterIndex, setLetterIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  // Dummy state to force rerender
  const {rerender, rerenderToken} = useRerender();
  

  // Reset
  useEffect(() => {
    setLetterIndex(0);
    setIsBlinking(false);
  }, [text]);

  const currentText = useMemo(() => {
    return text.slice(0, letterIndex);
  }, [letterIndex, text]);


  useEffect(() => {
    window.addEventListener('focus', rerender);

    return () => window.removeEventListener('focus', rerender);
  }, []);

  useEffect(() => {
    if (!enableBlink) {
      return;
    }

    const timeoutId = setInterval(() => {
      setIsBlinking(b => !b);
    }, blinkSpeedMs);

    const cancel = () => clearTimeout(timeoutId);

    window.addEventListener('blur', cancel);

    return () => {
      cancel();
      window.removeEventListener('blur', cancel);
    };
  }, [blinkSpeedMs, enableBlink, rerenderToken]);

  useEffect(() => {
    const timeoutId = setInterval(() => {
      setLetterIndex(idx => Math.min(idx + 1, text.length + tokenBuffer));
    }, timeForLetterMs);

    const cancel = () => clearTimeout(timeoutId);

    window.addEventListener('blur', cancel);

    return () => {
      cancel();
      window.removeEventListener('blur', cancel);
    };
  }, [timeForLetterMs, text, rerenderToken, tokenBuffer]);

  useEffect(() => {
    if (onComplete && letterIndex === text.length + tokenBuffer) {
      onComplete();
    }
  }, [letterIndex, text, onComplete])

  return (
    <>
      <BlinkingSpan className="ticker" blinking={isBlinking}>{currentText}</BlinkingSpan>
    </>
  )
}