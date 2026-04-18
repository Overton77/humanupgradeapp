Yes — you probably do need to differentiate relation inputs per related model, at least for any relation where you want real nested behavior.

Your current shared inputs are too generic:

WhereUniqueInput is global and only supports id / slug
ToManyRelationOperationInput only supports set, connect, disconnect
ToOneRelationOperationInput only supports connect, disconnect

That means LabTest.testsBiomarkers, Product.containsCompounds, Episode.guests, Organization.owners, and similar relations all get the same weak contract, even though each relation has different identity rules and different create semantics. In your schema, LabTestUpdateInput.testsBiomarkers is just ToManyRelationOperationInput, so there is no way to express nested create or connect-or-create for biomarkers at all. The same limitation exists across the other relation fields using those shared inputs.

What I would do

Do not keep one universal ToManyRelationOperationInput / ToOneRelationOperationInput for all models.

Instead, move to relation-specific inputs:

<RelatedModel>WhereUniqueInput
<RelatedModel>CreateWithout<Parent>Input or <RelatedModel>CreateInput
<RelatedModel>ConnectOrCreateInput
<RelatedModel>ToManyRelationInput
<RelatedModel>ToOneRelationInput

That gives you:

typed unique selectors per model
real nested create
connectOrCreate
room for relation-specific rules in code
Why the current design breaks down

A single WhereUniqueInput is only okay if every model has the same unique identity surface. They do not.

Today it is:

input WhereUniqueInput {
id: ID
slug: String
}

That is underpowered for future growth. Some models may eventually want:

id
slug
externalRef
name + organization
doi
url
composite natural keys

Once you need model-specific uniqueness, the generic input becomes a bottleneck.

Also, create semantics differ by relation:

LabTest.testsBiomarkers should likely allow nested creation of biomarkers
Episode.guests may allow connectOrCreate by slug/fullName
Organization.owners may permit connectOrCreate for Person
some relations may not allow nested create at all

A single generic relation input cannot express that cleanly.

Recommended shape

1. Replace global WhereUniqueInput with per-model unique inputs

Example:

input PersonWhereUniqueInput {
id: ID
slug: String
}

input BiomarkerWhereUniqueInput {
id: ID
slug: String
}

input OrganizationWhereUniqueInput {
id: ID
slug: String
}

input ProductWhereUniqueInput {
id: ID
slug: String
}

Later, if Biomarker gets externalRef or canonicalName uniqueness, you can add it there without contaminating every other model.

2. Add relation-specific nested inputs

For your main pain point:

input BiomarkerConnectOrCreateInput {
where: BiomarkerWhereUniqueInput!
create: BiomarkerCreateInput!
}

input BiomarkerToManyRelationInput {
set: [BiomarkerWhereUniqueInput!]
connect: [BiomarkerWhereUniqueInput!]
disconnect: [BiomarkerWhereUniqueInput!]
create: [BiomarkerCreateInput!]
connectOrCreate: [BiomarkerConnectOrCreateInput!]
}

Then:

input LabTestUpdateInput {
name: String
description: StringNullableOperationInput
labName: StringNullableOperationInput
reportUrl: StringNullableOperationInput
testedAt: DateTimeNullableOperationInput
sampleType: StringNullableOperationInput
tags: StringListOperationInput
product: ProductToOneRelationInput
organization: OrganizationToOneRelationInput
testsBiomarkers: BiomarkerToManyRelationInput
}

That immediately fixes the LabTest.(biomarkers) problem.

3. Do the same for to-one relations

Example:

input OrganizationConnectOrCreateInput {
where: OrganizationWhereUniqueInput!
create: OrganizationCreateInput!
}

input OrganizationToOneRelationInput {
connect: OrganizationWhereUniqueInput
create: OrganizationCreateInput
connectOrCreate: OrganizationConnectOrCreateInput
disconnect: Boolean
}

Then:

input ProductUpdateInput {
...
organization: OrganizationToOneRelationInput
containsCompounds: CompoundToManyRelationInput
}

This is much more expressive than the current ToOneRelationOperationInput.

Should you reuse <Model>CreateInput?

Usually: yes, but carefully.

There are two common approaches.

Option A: Reuse <Model>CreateInput

This is fastest and simplest.

input BiomarkerConnectOrCreateInput {
where: BiomarkerWhereUniqueInput!
create: BiomarkerCreateInput!
}

Good when:

your create inputs are already clean
they do not force parent foreign keys that nested resolvers will populate
you can tolerate some overexposure
Option B: Create nested-specific create inputs

Better long-term.

input BiomarkerCreateWithoutLabTestsInput {
slug: String!
name: String!
description: String
unit: String
category: String
...
}

Good when:

parent linkage should not be user-specified
nested creation rules differ from top-level creation
you want tighter schema discipline

For your system, I would lean toward:

start by reusing existing CreateInputs where safe
then introduce CreateWithout<Parent> variants for models that become awkward

Example: if nested creation of Biomarker inside LabTest should not allow unrelated relation writes, then BiomarkerCreateWithoutLabTestsInput is cleaner.

Best practical design for your editor model

You said you cannot use input unions, but can discriminate in code. That is fine. You do not need unions.

Use a shape like this:

input BiomarkerToManyRelationInput {
set: [BiomarkerWhereUniqueInput!]
connect: [BiomarkerWhereUniqueInput!]
disconnect: [BiomarkerWhereUniqueInput!]
create: [BiomarkerCreateInput!]
connectOrCreate: [BiomarkerConnectOrCreateInput!]
}

Then enforce in resolver/service code:

set cannot be mixed with certain operations if you want simpler semantics
reject conflicting operations
process in a deterministic order

Suggested execution order for to-many updates:

set
disconnect
connect
create
connectOrCreate

Or stricter:

either set
or any mix of connect / disconnect / create / connectOrCreate

That is easy to discriminate in code.

Concrete recommendation for your schema

Here is the direction I would take.

Keep:
scalar operation inputs like StringNullableOperationInput
list operation inputs like StringListOperationInput

These are fine.

Remove or deprecate:
WhereUniqueInput
ToManyRelationOperationInput
ToOneRelationOperationInput
Replace with:
PodcastWhereUniqueInput
EpisodeWhereUniqueInput
PersonWhereUniqueInput
OrganizationWhereUniqueInput
ProductWhereUniqueInput
CompoundWhereUniqueInput
LabTestWhereUniqueInput
BiomarkerWhereUniqueInput
CaseStudyWhereUniqueInput

and relation inputs such as:

PersonToManyRelationInput
OrganizationToManyRelationInput
CompoundToManyRelationInput
BiomarkerToManyRelationInput
OrganizationToOneRelationInput
ProductToOneRelationInput
etc.
Example refactor for the exact pain points
Current

LabTestUpdateInput:

input LabTestUpdateInput {
...
product: ToOneRelationOperationInput
organization: ToOneRelationOperationInput
testsBiomarkers: ToManyRelationOperationInput
}

This cannot nested-create biomarkers.

Better
input ProductWhereUniqueInput {
id: ID
slug: String
}

input OrganizationWhereUniqueInput {
id: ID
slug: String
}

input BiomarkerWhereUniqueInput {
id: ID
slug: String
}

input ProductConnectOrCreateInput {
where: ProductWhereUniqueInput!
create: ProductCreateInput!
}

input OrganizationConnectOrCreateInput {
where: OrganizationWhereUniqueInput!
create: OrganizationCreateInput!
}

input BiomarkerConnectOrCreateInput {
where: BiomarkerWhereUniqueInput!
create: BiomarkerCreateInput!
}

input ProductToOneRelationInput {
connect: ProductWhereUniqueInput
create: ProductCreateInput
connectOrCreate: ProductConnectOrCreateInput
disconnect: Boolean
}

input OrganizationToOneRelationInput {
connect: OrganizationWhereUniqueInput
create: OrganizationCreateInput
connectOrCreate: OrganizationConnectOrCreateInput
disconnect: Boolean
}

input BiomarkerToManyRelationInput {
set: [BiomarkerWhereUniqueInput!]
connect: [BiomarkerWhereUniqueInput!]
disconnect: [BiomarkerWhereUniqueInput!]
create: [BiomarkerCreateInput!]
connectOrCreate: [BiomarkerConnectOrCreateInput!]
}

input LabTestUpdateInput {
name: String
description: StringNullableOperationInput
labName: StringNullableOperationInput
reportUrl: StringNullableOperationInput
testedAt: DateTimeNullableOperationInput
sampleType: StringNullableOperationInput
tags: StringListOperationInput
product: ProductToOneRelationInput
organization: OrganizationToOneRelationInput
testsBiomarkers: BiomarkerToManyRelationInput
}

Now your editor model can express:

connect biomarker by id or slug
disconnect biomarker by id or slug
replace whole biomarker set
create biomarkers inline
connect-or-create many biomarkers inline

That is the missing robustness you are asking for.

What about “certain models should be differentiated more”?

Yes. Absolutely.

Not every relation should expose the same verbs.

For example:

some relations should allow connect only
some should allow connect + disconnect
some should allow create
some should allow connectOrCreate
some should allow set
some may forbid disconnect if required semantically

So the schema should reflect capabilities of the relation, not a universal abstraction.

That means it is fine to have:

input EpisodeGuestsRelationInput { ... }
input EpisodeSponsorOrganizationsRelationInput { ... }
input LabTestBiomarkersRelationInput { ... }

even if they point to the same target type. This is more verbose, but much more precise.

A good middle ground is:

model-specific where/create/connectOrCreate inputs
relation-specific wrappers only when semantics differ
Important resolver rule

Because GraphQL input objects cannot express “exactly one of these fields”, your code should validate:

connect, create, connectOrCreate, set, disconnect are not used in impossible combinations
each where has exactly one valid unique selector
connectOrCreate.where maps to an actual unique constraint
create data does not violate uniqueness during nested writes

So yes, discrimination in code is the right place for this.

My recommendation in one sentence

Do not try to stretch the generic relation inputs. Replace them with typed per-model relation inputs, add create and connectOrCreate, and optionally introduce relation-specific nested create inputs where reuse of top-level creates becomes awkward.

Migration strategy
Add per-model WhereUniqueInputs.
Add typed relation inputs for the most painful relations first:
LabTest.testsBiomarkers
Product.containsCompounds
Episode.guests
Organization.owners
Organization.executives
Add create and connectOrCreate.
Keep old generic inputs temporarily for backward compatibility.
Deprecate old relation fields in mutations if needed.
Later tighten nested creates with CreateWithout<Parent> variants.
Bottom line

For your case, I would implement:

per-model unique inputs
per-related-model relation inputs
create
connectOrCreate
connectOrCreate: [..] on to-many
nested create support on update mutations, especially LabTest -> biomarkers

That is the correct structural fix. The current abstraction is too generic for the editor UX and too weak for nested graph writes.
