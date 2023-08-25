import { useState } from "react";
import { IView } from "../common";
import { useJoin } from "../hooks/useJoin";
import BrickView from "./brick-1/View";
import SpookyTorusView from "./spooky-torus/View";

// Add new lessons here!
const lessons: IView[] = [
  BrickView,
  SpookyTorusView,
].reverse();

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
  })
  return (
    <>
      {currentLesson.component()}
      <div className="lesson-navbar">
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
          <hr/>
          <div>
            {lessonsToRender}
          </div>
        </div>
      </div>
    </>
  );
}


export default LessonSelector;