const VICTIMS_INIT = 100;
const PREDATORS_INIT = 20;

const GROWS_VICTIMS = 0.2;
const GROWS_PREDATORS = 0.1;

const T0 = 0.5;
const K = 0.08;

const MAX_VICTIMS = 500;

const EFFIC = 0.1;

const STEP = 1;

const ITERATIONS = 500;

//effic = 0.0001

//effic = 0.1

//effic = 1

function chart_init(chart_data) {
  const data = {
    datasets: [
      {
        label: "Euler",
        data: [],
        backgroundColor: "rgb(255, 99, 132)",
      },
      {
        label: "Runge",
        data: [],
        backgroundColor: "rgb(0, 255, 0)",
      },
    ],
  };
  //   const data = {
  //     labels: [],
  //     datasets: [
  //       {
  //         label: "Euler-victims",
  //         data: [],
  //         backgroundColor: "rgb(255, 99, 132)",
  //       },
  //       {
  //         label: "Runge-victims",
  //         data: [],
  //         backgroundColor: "rgb(255, 250, 132)",
  //       },
  //       {
  //         label: "Runge-predators",
  //         data: [],
  //         backgroundColor: "rgb(0, 255, 0)",
  //       },
  //       {
  //         label: "Euler-predators",
  //         data: [],
  //         backgroundColor: "rgb(0, 200, 0)",
  //       },
  //     ],
  //   };

  //   for (let i = 0; i < ITERATIONS; i++) {
  //     data.labels.push(i * STEP);
  //   }

  const [euler, runge] = chart_data;
  //   euler.forEach((dotStruct) => {
  //     data.datasets[0].data.push(dotStruct.victims);
  //   });
  //   euler.forEach((dotStruct) => {
  //     data.datasets[3].data.push(dotStruct.predators);
  //   });
  //   runge.forEach((dotStruct) => {
  //     data.datasets[1].data.push(dotStruct.victims);
  //   });
  //   runge.forEach((dotStruct) => {
  //     data.datasets[2].data.push(dotStruct.predators);
  //   });
  euler.forEach((dotStruct) => {
    data.datasets[0].data.push({
      x: dotStruct.victims,
      y: dotStruct.predators,
      r: 3,
    });
  });

  runge.forEach((dotStruct) => {
    data.datasets[1].data.push({
      x: dotStruct.victims,
      y: dotStruct.predators,
      r: 3,
    });
  });

  new Chart(document.getElementById("container"), {
    type: "bubble",
    data: data,
    options: {},
  });
}

class DotStructure {
  constructor(victims, predators) {
    this.victims = victims;
    this.predators = predators;
  }
}

const solve_equation = (victims, predators) => {
  let nextVictims =
    GROWS_VICTIMS * (1 - victims / MAX_VICTIMS) * victims -
    (EFFIC * victims * predators) / (1 + EFFIC * T0 * victims);

  let nextPredators =
    GROWS_PREDATORS * (1 - predators / (K * victims)) * predators;

  if (victims + STEP * nextVictims < 0) {
    return new DotStructure(0, predators + STEP * nextPredators);
  }

  return new DotStructure(
    victims + STEP * nextVictims,
    predators + STEP * nextPredators
  );
};

const solve_equation_runge = (victims, predators) => {
  const functionX = (localVictims, localPredators) =>
    GROWS_VICTIMS * (1 - localVictims / MAX_VICTIMS) * localVictims -
    (EFFIC * localVictims * localPredators) / (1 + EFFIC * T0 * localVictims);

  const functionY = (localVictims, localPredators) =>
    GROWS_PREDATORS *
    (1 - localPredators / (K * localVictims)) *
    localPredators;

  const k1 = functionX(victims, predators) * STEP;
  const m1 = functionY(victims, predators) * STEP;

  const k2 = functionX(victims + k1 / 2, predators + m1 / 2) * STEP;
  const m2 = functionY(victims + k1 / 2, predators + m1 / 2) * STEP;

  const k3 = functionX(victims + k2 / 2, predators + m2 / 2) * STEP;
  const m3 = functionY(victims + k2 / 2, predators + m2 / 2) * STEP;

  const k4 = functionX(victims + k3, predators + m3) * STEP;
  const m4 = functionY(victims + k3, predators + m3) * STEP;

  let nextVictims = victims + (k1 + 2 * k2 + 2 * k3 + k4) / 6;
  const nextPredators = predators + (m1 + 2 * m2 + 2 * m3 + m4) / 6;

  if (nextVictims < 0) {
    nextVictims = 0;
  }

  // Xk+1 = Xk + 1/6 (k1 + k2 + k3 + k4)
  //k1: f (Xk, Yk) * STEP
  //k2: f (Xk + k1 / 2, Yk + m1 / 2) * STEP
  //k3: f (Xk + k2 / 2, Yk + m2 / 2) * STEP
  //k4: f (Xk + k3, Yk + m3) * STEP

  return new DotStructure(nextVictims, nextPredators);
};

const calculate_data = () => {
  // u' = f(t, u(t))
  // u(t) = (h(t), p(t))
  const result = [new DotStructure(VICTIMS_INIT, PREDATORS_INIT)];
  const resultRunge = [new DotStructure(VICTIMS_INIT, PREDATORS_INIT)];

  for (let i = 0; i < ITERATIONS; i++) {
    result.push(solve_equation(result[i].victims, result[i].predators));
    resultRunge.push(
      solve_equation_runge(resultRunge[i].victims, resultRunge[i].predators)
    );
  }

  return [result, resultRunge];
};

chart_init(calculate_data());
