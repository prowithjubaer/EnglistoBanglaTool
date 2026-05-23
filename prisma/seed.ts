import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'
const prisma = new PrismaClient()
async function main() {
  console.log('Seeding...')
  await prisma.settings.deleteMany(); await prisma.studentBadge.deleteMany(); await prisma.studentStats.deleteMany()
  await prisma.savedVocabulary.deleteMany(); await prisma.difficultItem.deleteMany(); await prisma.reviewLater.deleteMany()
  await prisma.submission.deleteMany(); await prisma.homeworkTask.deleteMany(); await prisma.homeworkAssignment.deleteMany()
  await prisma.homework.deleteMany(); await prisma.vocabulary.deleteMany(); await prisma.task.deleteMany()
  await prisma.category.deleteMany(); await prisma.level.deleteMany(); await prisma.badge.deleteMany()
  await prisma.user.deleteMany(); await prisma.batch.deleteMany()
  const batch = await prisma.batch.create({data:{name:'Batch 01'}})
  const adminPass = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({data:{name:'Admin',email:'admin@proenglishbd.com',passwordHash:adminPass,role:'admin',status:'active'}})
  const studentPass = await bcrypt.hash('student123', 12)
  const student = await prisma.user.create({data:{name:'Demo Student',email:'student@proenglishbd.com',passwordHash:studentPass,role:'student',status:'active',batchId:batch.id}})
  const levels = await Promise.all([
    prisma.level.create({data:{title:'Level 1: Very Easy Sentences',description:'Basic sentences',order:1,difficulty:'easy'}}),
    prisma.level.create({data:{title:'Level 2: Basic Daily Life',description:'Daily comprehension',order:2,difficulty:'easy'}}),
    prisma.level.create({data:{title:'Level 3: Compound Sentences',description:'and, but, or, so',order:3,difficulty:'medium'}}),
    prisma.level.create({data:{title:'Level 4: Complex Sentences',description:'because, although, if',order:4,difficulty:'medium'}}),
    prisma.level.create({data:{title:'Level 5: Short Paragraphs',description:'3-5 line paragraphs',order:5,difficulty:'medium'}}),
    prisma.level.create({data:{title:'Level 6: Academic Paragraphs',description:'Formal English',order:6,difficulty:'hard'}}),
    prisma.level.create({data:{title:'Level 7: IELTS Mini Passage',description:'Short IELTS passages',order:7,difficulty:'ielts'}}),
    prisma.level.create({data:{title:'Level 8: Full IELTS Passage',description:'Full IELTS Reading',order:8,difficulty:'ielts'}}),
  ])
  const cats = await Promise.all([
    prisma.category.create({data:{name:'Daily Life English'}}),prisma.category.create({data:{name:'Spoken English Foundation'}}),
    prisma.category.create({data:{name:'Grammar-based Sentences'}}),prisma.category.create({data:{name:'Tense Practice'}}),
    prisma.category.create({data:{name:'Vocabulary Practice'}}),prisma.category.create({data:{name:'Academic English'}}),
    prisma.category.create({data:{name:'IELTS Reading'}}),prisma.category.create({data:{name:'Business English'}}),
    prisma.category.create({data:{name:'Job Interview English'}}),prisma.category.create({data:{name:'Travel English'}}),
  ])
  const tasks = [
    {e:'I eat rice.',b:'আমি ভাত খাই।',l:0,c:0,d:'easy',v:[{w:'eat',m:'খাওয়া'},{w:'rice',m:'ভাত'}]},
    {e:'She goes to school.',b:'সে স্কুলে যায়।',l:0,c:0,d:'easy',v:[{w:'goes',m:'যায়'},{w:'school',m:'স্কুল'}]},
    {e:'They are playing.',b:'তারা খেলছে।',l:0,c:1,d:'easy',v:[{w:'playing',m:'খেলছে'}]},
    {e:'I usually wake up early in the morning.',b:'আমি সাধারণত সকালে তাড়াতাড়ি ঘুম থেকে উঠি।',l:1,c:0,d:'easy',v:[{w:'usually',m:'সাধারণত'},{w:'wake up',m:'ঘুম থেকে ওঠা'}]},
    {e:'I wanted to go outside, but it started raining.',b:'আমি বাইরে যেতে চেয়েছিলাম, কিন্তু বৃষ্টি শুরু হয়ে গেল।',l:2,c:2,d:'medium',v:[{w:'wanted to',m:'চেয়েছিলাম'},{w:'started raining',m:'বৃষ্টি শুরু হলো'}]},
    {e:'Although he was tired, he continued working because he had an important deadline.',b:'যদিও সে ক্লান্ত ছিল, তবুও সে কাজ চালিয়ে গেল।',l:3,c:2,d:'medium',v:[{w:'although',m:'যদিও'},{w:'tired',m:'ক্লান্ত'},{w:'deadline',m:'সময়সীমা'}]},
    {e:'If you study regularly, you will improve your English skills.',b:'যদি তুমি নিয়মিত পড়াশোনা করো, তাহলে তোমার ইংরেজি দক্ষতা উন্নত হবে।',l:3,c:2,d:'medium',v:[{w:'regularly',m:'নিয়মিত'},{w:'improve',m:'উন্নত করা'}]},
  ]
  for (const t of tasks) {
    const task = await prisma.task.create({data:{englishText:t.e,banglaTranslation:t.b,levelId:levels[t.l].id,categoryId:cats[t.c].id,difficulty:t.d,status:'published',createdBy:admin.id,explanation:'Practice translation'}})
    if (t.v) await prisma.vocabulary.createMany({data:t.v.map(v=>({taskId:task.id,wordOrPhrase:v.w,banglaMeaning:v.m}))})
  }
  await prisma.badge.createMany({data:[
    {name:'First Translation',description:'First task done!',icon:'🎯',conditionType:'tasks_completed',conditionValue:1},
    {name:'10 Done',description:'10 tasks!',icon:'⭐',conditionType:'tasks_completed',conditionValue:10},
    {name:'7 Day Streak',description:'7 day streak!',icon:'🔥',conditionType:'streak_days',conditionValue:7},
    {name:'90% Club',description:'90%+ score!',icon:'🥇',conditionType:'score_percent',conditionValue:90},
    {name:'100% Master',description:'Perfect!',icon:'👑',conditionType:'score_percent',conditionValue:100},
  ]})
  const hw = await prisma.homework.create({data:{title:'Week 1 - Basic Sentences',description:'First homework',assignedType:'all',startDate:new Date(),deadline:new Date(Date.now()+7*86400000),passingAverageScore:70,status:'published',createdBy:admin.id}})
  const allTasks = await prisma.task.findMany({take:5})
  for (let i=0;i<allTasks.length;i++) await prisma.homeworkTask.create({data:{homeworkId:hw.id,taskId:allTasks[i].id,order:i+1}})
  await prisma.homeworkAssignment.create({data:{homeworkId:hw.id,batchId:batch.id}})
  await prisma.studentStats.create({data:{studentId:student.id}})
  const settings = [{key:'allow_registration',value:'true'},{key:'allow_retry',value:'true'},{key:'show_answer_after_submit',value:'true'},{key:'enable_timer',value:'true'},{key:'enable_badges',value:'true'},{key:'enable_points',value:'true'},{key:'enable_streak',value:'true'},{key:'allow_free_practice',value:'true'},{key:'enable_focus_mode',value:'true'},{key:'default_deadline_days',value:'7'},{key:'passing_score',value:'70'}]
  for (const s of settings) await prisma.settings.create({data:s})
  console.log('Done! Admin: admin@proenglishbd.com/admin123, Student: student@proenglishbd.com/student123')
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect())
