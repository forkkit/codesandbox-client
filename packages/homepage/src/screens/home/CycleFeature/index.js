import React from 'react';
import styled from 'styled-components';
import { TimelineMax, Power2 } from 'gsap';

import Centered from '@codesandbox/common/lib/components/flex/Centered';
import MaxWidth from '@codesandbox/common/lib/components/flex/MaxWidth';

import Theme from '@codesandbox/common/lib/theme';

import GithubIcon from 'react-icons/lib/go/mark-github';
import BuildIcon from 'react-icons/lib/go/tools';
import CommitIcon from 'react-icons/lib/go/git-commit';
import RocketIcon from 'react-icons/lib/go/rocket';

import { useMatchMedia } from '../../../hooks';
import getScrollPos from '../../../utils/scroll';
import media from '../../../utils/media';

import Cube from './Cube';
import Step from './Step';

const Heading = styled.h2`
  text-align: center;
  font-weight: 300;
  font-size: 2.5rem;
  margin-top: 6rem;
  margin-bottom: 1rem;

  text-transform: uppercase;

  ${media.phone`
    margin-top: 3rem;
    margin-bottom: 0;
  `};

  color: ${({ theme }) => theme.secondary};
  text-shadow: 0 0 50px ${({ theme }) => theme.secondary.clearer(0.6)};
`;

const SubHeading = styled.p`
  font-size: 1.25rem;
  text-align: center;

  font-weight: 200;
  line-height: 1.4;
  max-width: 40rem;

  color: rgba(255, 255, 255, 0.8);
`;

const Steps = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  list-style: none;
  margin: 0;

  ${media.tablet`
    flex: 1;
  `};
`;

const Flow = styled.div`
  display: flex;
  margin-top: 8rem;
`;

const OffsettedCube = styled.div`
  margin-top: -80px;
`;

const CubeSteps = styled.div`
  position: relative;
  display: flex;
  flex: 1;

  margin-left: 4rem;
  align-items: center;
  justify-content: center;

  ${media.tablet`
    flex: 2;
  `};

  ${media.phone`
    display: none;
  `};
`;

const ImportContainer = styled.div`
  position: absolute;
  width: 100%;
  background-color: ${({ theme }) => theme.background5};
  padding-top: 1rem;

  top: 0;
`;

const DeployContainer = styled.div`
  position: absolute;
  width: 100%;
  background-color: ${({ theme }) => theme.background5};

  overflow: hidden;

  display: flex;
  justify-content: flex-start;

  bottom: 0;
  height: calc(250px - 1rem); /* The margin is the 1rem */
`;

const AddressBar = styled.a`
  display: block;
  position: relative;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1.125rem;
  color: white;
  font-weight: 200;
  margin-bottom: 1rem;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }

  text-decoration: none;

  border: 1px solid rgba(0, 0, 0, 0.2);

  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.3);
`;

const AddedUrl = styled.span`
  color: ${({ theme }) => theme.secondary};
  text-align: right;
  overflow: hidden;
`;

const Progress = styled.div`
  position: absolute;
  width: 0;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  border-radius: 4px;

  background-color: ${props => props.theme.secondary};
  box-shadow: 0 0 100px ${props => props.theme.secondary.clearer(0.3)};
`;

const CycleFeatures = () => {
  const verticalSteps = React.useRef({});
  const cube = React.useRef();
  const animation = React.useRef();
  const reduceAnimation = useMatchMedia('(prefers-reduced-motion: reduce)');
  const [selectedStep, setSelectedStep] = React.useState(0);
  const [manuallySelected, setManuallySelected] = React.useState(false);

  const selectStep = React.useCallback(
    (step, manual = true) => {
      if ((!manual && manuallySelected) || !animation.current) {
        // User selected manually, we don't want to override manual behaviour
        // with scroll behaviour
        return;
      }

      if (selectedStep === 3) {
        animation.current.progress(0);
      }

      setSelectedStep(step);
      setManuallySelected(manual);

      animation.current.tweenTo('step' + (step + 1));
    },
    [manuallySelected, selectedStep]
  );

  const setStepForScroll = React.useCallback(
    (scroll: number, step: number) => {
      if (
        scroll + window.innerHeight / 2 > verticalSteps.current[step] &&
        step > selectedStep
      ) {
        selectStep(step, false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectStep, selectedStep, reduceAnimation]
  );

  const updateStepBasedOnScroll = React.useCallback(() => {
    const scrollTop = getScrollPos().y;

    for (let i = 0; i < 4; i++) {
      setStepForScroll(scrollTop, i);
    }
  }, [setStepForScroll]);

  const setY = (step: number, y: number) => {
    verticalSteps.current[step] = verticalSteps.current[step] || y;
  };

  React.useEffect(() => {
    if (reduceAnimation) {
      setSelectedStep(3);
    } else {
      setSelectedStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceAnimation]);

  React.useEffect(() => {
    if (reduceAnimation) return;

    window.addEventListener('scroll', updateStepBasedOnScroll);

    // eslint-disable-next-line consistent-return
    return () => window.removeEventListener('scroll', updateStepBasedOnScroll);
  }, [reduceAnimation, updateStepBasedOnScroll]);

  React.useEffect(() => {
    if (!cube.current || reduceAnimation) return;

    const cubeY = cube.current.getBoundingClientRect().top;

    animation.current = new TimelineMax({ paused: true })
      .set('#addition-cube', {
        y: 0,
        x: 0,
        zIndex: 2,
        transformOrigin: '50% 50%',
        position: 'absolute',
      })
      .set('.main-cube-side', {
        backgroundColor: Theme.secondary.clearer(0.2)(),
        zIndex: 1,
        boxShadow: `0px 0px 150px ${Theme.secondary()}`,
      })
      .set('#progress-text', {
        autoAlpha: 0,
        display: 'none',
      })
      .set('#deploy-text', {
        autoAlpha: 0,
        display: 'none',
      })
      .set('#deploy-container-address', {
        height: 46,
        width: '100%',
      })
      .to('#deploy-container', 0.3, {
        width: 0,
      })
      .fromTo(
        cube.current,
        0.8,
        {
          scale: 0,
          x: 0,
          position: 'relative',
          rotation: 0,
          y: verticalSteps.current[0] - cubeY - 40,
        },
        {
          y: verticalSteps.current[0] - cubeY - 40,
          ease: Power2.easeInOut,
        }
      )
      .to(
        cube.current,
        1.2,
        {
          y: verticalSteps.current[1] - cubeY - 40,
          scale: 1,
          rotation: 720,
          ease: Power2.easeInOut,
        },
        'step1'
      )
      .set('.main-cube-side', { backgroundColor: Theme.primary.clearer(0.2)() })
      .to('#addition-cube', 0.6, {
        ease: Power2.easeOut,
        y: -45,
      })
      .to(
        '#main-cube',
        0.6,
        {
          ease: Power2.easeOut,
          y: 45,
        },
        '-=0.6'
      )
      .to(
        '.main-cube-side',
        0.2,
        {
          boxShadow: `0px 0px 150px ${Theme.primary()}`,
        },
        '-=0.6'
      )
      .to(
        cube.current,
        1.2,
        {
          y: verticalSteps.current[2] - cubeY - 40,

          ease: Power2.easeInOut,
        },
        'step2'
      )
      .to(
        '#main-cube',
        0.6,
        {
          y: '+=30',
          ease: Power2.easeIn,
        },
        '-=1.2'
      )
      .to(
        '#main-cube',
        0.6,
        {
          y: 40,
          ease: Power2.easeOut,
        },
        '-=0.6'
      )
      .to(
        '#addition-cube',
        0.2,
        {
          y: -40,
        },
        '-=0.2'
      )
      .to('.main-cube-side', 0.7, {
        backgroundColor: Theme.secondary.clearer(0.2)(),
        boxShadow: `0px 0px 150px ${Theme.secondary()}`,
        ease: Power2.easeInOut,
      })
      .to(
        '#deploy-container',
        0.6,
        {
          width: '100%',
          ease: Power2.easeInOut,
        },
        'step3'
      )
      .to(cube.current, 1.2, {
        y: verticalSteps.current[3] - cubeY + 40,
        scale: 0.5,
        ease: Power2.easeInOut,
      })
      .to('#progress-text', 0.3, {
        autoAlpha: 1,
        display: 'inline-block',
      })
      .to('#progress', 2, { width: '100%', ease: Power2.easeIn })
      .set('#progress-text', {
        autoAlpha: 0,
        display: 'none',
      })
      .set('#deploy-text', {
        autoAlpha: 1,
        display: 'inline-block',
      })
      .to('#progress', 0.3, { height: 0, ease: Power2.easeInOut })
      .to(cube.current, 0, {}, 'step4');

    animation.current.tweenTo('step1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceAnimation]);

  return (
    <section aria-labelledby="be-productive">
      <MaxWidth width={1280}>
        <Centered horizontal>
          <Heading id="be-productive">Be Productive, Anywhere</Heading>
          <SubHeading>
            We aim to give you the tools to build a full blown web application.
            You can easily import projects from GitHub, make commits, and
            finally deploy. We support the whole cycle.
          </SubHeading>
          {/*
          <StepDescription>
            You can import projects on GitHub by going to
            codesandbox.io/s/github.
          </StepDescription> */}
        </Centered>

        <Flow>
          <Steps as="ul">
            <Step
              selected={selectedStep >= 0}
              i={0}
              selectedStep={selectedStep}
              selectStep={selectStep}
              getY={setY}
              Icon={GithubIcon}
              title="Import"
              description="Paste your GitHub URL. You get a sandbox that stays up to date with the latest changes automatically."
            />
            <Step
              selected={selectedStep >= 1}
              i={1}
              selectedStep={selectedStep}
              selectStep={selectStep}
              getY={setY}
              Icon={BuildIcon}
              title="Build"
              description="Fork the sandbox and start building that long awaited feature!"
            />
            <Step
              selected={selectedStep >= 2}
              i={2}
              selectedStep={selectedStep}
              selectStep={selectStep}
              getY={setY}
              Icon={CommitIcon}
              title="Commit"
              description="Commit your changes or open a pull request with a user friendly UI."
            />
            <Step
              selected={selectedStep >= 3}
              i={3}
              selectedStep={selectedStep}
              selectStep={selectStep}
              getY={setY}
              Icon={RocketIcon}
              title="Deploy"
              description="Deploy a production version of your sandbox using ZEIT's Now."
            />
          </Steps>

          {!reduceAnimation && (
            <CubeSteps aria-hidden>
              <OffsettedCube ref={cube}>
                <Cube
                  id="addition-cube"
                  noAnimation
                  size={90}
                  offset={40}
                  color={Theme.secondary}
                  style={{ position: 'absolute', top: 0 }}
                />
                <Cube
                  id="main-cube"
                  noAnimation
                  size={90}
                  offset={40}
                  color={Theme.primary}
                  style={{ position: 'absolute', top: 0 }}
                />
              </OffsettedCube>
              <ImportContainer>
                <AddressBar
                  aria-hidden
                  href="https://github.com/reduxjs/redux/tree/master/examples/todos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>github.com/</span>
                  <AddedUrl>reduxjs/redux/tree/master/examples/todos</AddedUrl>
                </AddressBar>
                <AddressBar
                  aria-hidden
                  href="/s/github/reduxjs/redux/tree/master/examples/todos"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>codesandbox.io/s/github/</span>
                  <AddedUrl>reduxjs/redux/tree/master/examples/todos</AddedUrl>
                </AddressBar>
              </ImportContainer>

              <DeployContainer id="deploy-container">
                <AddressBar
                  aria-hidden
                  id="deploy-container-address"
                  href="https://csb-921ywn9qrw-emlplxhibt.now.sh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open deployed sandbox"
                >
                  <span id="progress-text" style={{ textAlign: 'center' }}>
                    Deploying...
                  </span>
                  <span style={{ color: Theme.secondary() }} id="deploy-text">
                    https://csb-921ywn9qrw-emlplxhibt.now.sh/
                  </span>
                  <Progress id="progress" />
                </AddressBar>
              </DeployContainer>
            </CubeSteps>
          )}
        </Flow>
      </MaxWidth>
    </section>
  );
};

export default React.memo(CycleFeatures);
