# How Judging works

## Core concepts

The Judging system consists of 7 main entities:
- Category: Prize category projects can submit to. Often we have 3 types of categories: Sponsor, In-house, and General
- Judge: Each judge must be assigned to one category
- Project: Project data we got from DevPost
- Judge group: Judges are organized into groups to move together to speed up judging
- Submission: Records which project is submitted to which category - identifed by a unique (projectId, categoryId) composite key
- Assignment: Projects are then assigned into judge groups - which is recorded into the `assignment` table, identified by a unique (projectId, judgeGroupId) composite key
- Evaluation: Records the scores each judge gives to their assigned project - identify by a unique (projectId, judgeId) composite key

The Judging dashboard and portal also handles the following aspects:
- Assign judges into groups
- Assign projects into appropriate judge groups
- Enable judges to evaluate assigned projects, and then use the evaluation data to arrive at the final winner verdict

## Judging system algorithm

### Design philosophy and decision

The Judging process must balance between **Fast** and **Fair**:
- Fast: Efficiently utilize the full capabilities of all judges we have. Ideally, projects are evenly distributed; each judge is assigned similar number of projects, so that the evaluation process finishes quickly.
- Fair: For General 1st/2nd/3rd prizes, I want high level of scrutiny so that we know projects are deserved - This means as many judging eyes as possible when deciding our General winners.

Before 2026, we naively treated General as a separate category. This meant only General judges could evaluate General submissions (but ALL projects submit to General), thus concentrating all projects on a small group, while other categories handled only subsets - creating a bottleneck that slows the judging process. This process is relatively Fair, but not Fast.

Therefore for 2026, we want to **utilize ALL judges in assessing General winners**. I thus implement the following algorithm:
- Projects are still distributed in appropriate judge groups, but only for non-General categories
- If a project has insufficient judges after this first step, we assign these projects into additional General groups, so that every project is looked at by at least MINIMUM_JUDGES_PER_PROJECT value
- Then all judges, regardless of category, assign 1–5 scores (Originality, Learning, Execution) used for final rankings
  - Category judges additionally score Category Relevance to capture how well a project fits its intended category. This ensures their evaluations useful for overall judging, while still distinguishing which projects truly excel within a category.

Details of how we use the 1-to-5 scores to assess General ranking is in 'Technical Details' section below

### Algorithm details

#### Step 1: Upload projects from DevPost to Judging dashboard

#### Step 2: Disquality projects

We have a `scripts/fraud-detection` that validates a project is qualified:
- Project is created within the hackathon's timeline
- Project's authors don't exceed 4
- et.c

#### Step 3: Assigning judges into groups

- For Sponsor judges, we put them ALL into one group per Sponsor category
- For In-house and General judges, we split them into groups of two

#### Step 4: Assigning projects into judge groups

- Phase 1: Project submissions are assigned to corresponding-category judge groups in round-robin fashion (like dealing cards to players)
- Phase 2: If there are any projects that haven't been assigned a MINIMUM_JUDGES_PER_PROJECT judges (for example: If a project submits to zero Sponsor or Inhouse categories), we then assign them to General groups until the minimum is met
  - This mean **at least MINIMUM_JUDGES_PER_PROJECT General judges** are needed to guarantee coverage when a project has no category-specific submissions

#### Step 5: Presentations and Evaluation

Now that projects have been assigned, judges receive link to their judging portal to begin evaluating. The evaluation has 2 mini-phases

##### Phase 1: Scoring

For each project, judges give a 1-to-5 score on Originality, Learning, and Execution, along with a Category Relevance score if it's a non-General category.

##### Phase 2: Ranking

For non-General categories, we then ask each judge to rank top 5 **of their category** (not General), and accumulate all the Borda scores to determine the category winners. In the Ranking interface, we sort by `(score1 + score2 + score3) * (categoryRelevance / 5)` for their UX convenience, but their ranking is the ultimate decision.
- This explicit ranking step (instead of using the scores to implicitly determine category winners) helps capture project's essence and judges' intuition that a numeric formula may not capture

General judges will not need to rank

#### Step 6: Scoring calculation

Once all judges have scored and ranked, we calculate the winners.

- Categorial winners are determined by the Borda scores we got from each judges' ranking as detailed above
- For General 1st/2nd/3rd determination, we calculate an **implicit ranking** of that project's quality within each judge
  - Scores are averaged up per project, and an implicit General ranking per judge is produced by sorting this average score.
  - Then Borda points are assigned to the top-5-ranked projects within each judge's individual list (e.g., a judge's #1 project receives 5 points, #2 receives 4, etc.).
  - Total Borda points are aggregated for each project across the every judge to create a "Global General Score."
  - The final winners are determined by sorting all projects by this global score, with the top three totals taking 1st, 2nd, and 3rd place respectively.
    - Note: Not all projects are seen by equal number of judges, so we divide the Final Borda Score of each project by number of judges assigned to normalize

Doing the implicit ranking per judge help us avoid leniency biases accross different judges - **A project's quality is showcased on how it fares relatively within that judge's batch**

#### Step 7: Manual deliberation

Numbers only capture a part of a project's quality; a final panel of judges and organizers should delibrately check the top projects to ensure it actually qualifies (or that it didn't cheat)

## Some pragmatic concerns

### Judges' distribution

To ensure an even number of projects per judge groups, we must distrbute more judges into more popular categories.

Since the project submissions details are only known on the day-of after the DevPost closes, we should ensure there are a number of judges that can flex between different categories. The Judging Dashboard displays the number of projecs and judges per category in the `/judges-and-categories` page to help with this decision - we can very easily change the category of a judge via the dashboard.

We should also have a list of backup organizers that can serve as judges - in case judges don't want to change, or no-show

### How many MINIMUM_JUDGES_PER_PROJECT is enough ?

Usually 6 is good, but I have made MINIMUM_JUDGES_PER_PROJECT an input in the "Assign Projects To Group" form, so we can fluidly adapt based on real-world scenario. The more the better, but be aware of total judging time.

### Rubric

A rubric helps judges know better when to give a criteria 1 star of 5 stars. An example rubric is provided below:

#### Originality

| Stars   | Description |
|---------|-------------|
| 1 Star  | **Derivative**: A direct clone of an existing app or a standard "Hello World" style tutorial project. |
| 2 Stars | **Slight Variation**: A familiar idea with a very minor change, but no real surprise or innovation. |
| 3 Stars | **Solid Take**: A fresh application of known concepts; a new combination of existing tools to solve a standard problem. |
| 4 Stars | **Distinctive**: A clever solution that provides a very unique "twist" - *"I could imagine that but haven't seen someone combine those systems before"* |
| 5 Stars | **Inspirational**: A "Wow!" idea. A genuinely surprising and remarkably insightful solution that stands out; - *"I've never thought of that before."* |

#### Execution

| Stars   | Description |
|---------|-------------|
| 1 Star  | **Non-functional:** The project does not run; entirely based on mockups or a slide deck with no working logic. |
| 2 Stars | **Proof-of-Concept:** Only the absolute barest functionality works; prone to crashing during the presentation. |
| 3 Stars | **Working Prototype:** The core features work as intended, allowing for a successful end-to-end demo. Still has minor visual rough edges - still feels a bit unpolished. |
| 4 Stars | **Polished Demo:** Very cohesive flow, impressive user interface, and clearly optimized to deliver a flawless pitch presentation. The user experience feels "finished" and professional. No "hacks" were visible. |
| 5 Stars | **Seamless MVP:** An exceptional hackathon build. The presented feature set works without a hitch and the design feels intentional and "complete" for the scope of the project - *"I can't believe they built this in a weekend"*. |

#### Learning

| Stars   | Description |
|---------|-------------|
| 1 Star  | **Inside Comfort Zone:** The team stuck to tools they already master; no significant evidence of new skills acquired. |
| 2 Stars | **Minor Attempt:** Evidence of trying one or two small new libraries, but the implementation is very surface-level. |
| 3 Stars | **Growth Path:** Clearly stepped outside their usual technology stack or solved a domain problem that was new to them. |
| 4 Stars | **Ambitious Challenge:** Tackled a significant and unfamiliar technical or conceptual curve (e.g., implementing an AI model, new API integration, or unfamiliar backend structure). |
| 5 Stars | **Remarkable Leap:** The team clearly mastered a complex or difficult technology during the hackathon and used it to create a functioning result that surprised the judges given the time constraint. |
