import * as THREE from 'three';
import { useMemo, useState } from "react";
import { useJoin } from "../hooks/useJoin";

import { lessons } from './lessonList';
function LessonSelector() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson = lessons[currentLessonIndex];

  const lessonsToRender = useJoin({
    components: lessons.map((lesson, lessonIndex) => (
      <>
        <span style={{ cursor: 'pointer', textDecoration: lessonIndex === currentLessonIndex ? 'underline' : '' }} onClick={() => setCurrentLessonIndex(lessonIndex)}>
          {lesson.title}
        </span>
        &nbsp;
      </>
    )),
    delimiter: <> | </>
  });

  const component = useMemo(() => {
    return currentLesson.component();
  }, [currentLesson]);
  return (
    <>
      <div className="canvas-wrapper">
        {component}
      </div>
      <div className="lesson-navbar" style={currentLesson.sidebarProperties}>
        <div>
          <div>
            <p>
              <b>
                {currentLesson.title}
              </b> ({currentLesson.createdAt.toLocaleDateString()})
            </p>
            <p>
              {currentLesson.description}
            </p>
          </div>
          <hr />
          <div>
            {lessonsToRender}
          </div>
        </div>
      </div>
    </>
  );
}


export default LessonSelector;