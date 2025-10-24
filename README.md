# ADS Quiz Website - NPTEL

A beautiful, mobile-first quiz website for Advanced Data Structures (ADS) based on NPTEL content.

## Features

✨ **Mobile-First Design** - Optimized exclusively for mobile phones
🎨 **Translucent Animations** - Beautiful glassmorphism effects and smooth animations
📱 **Responsive UI** - Clean, modern interface with intuitive navigation
📚 **120 Questions** - Comprehensive coverage of ADS topics
📅 **Two Quiz Modes**:
   - **Full Series**: Complete 120 questions in sequence
   - **Weekly Series**: 10 questions per week, 12 weeks total
🔄 **Unlimited Retests** - Practice as many times as you want
📊 **Answer Review** - Review all answers with explanations
⏱️ **Timer Tracking** - See how long you take to complete quizzes

## Quick Start

1. **Start the server**:
   ```bash
   python3 server.py
   ```

2. **Open in browser**:
   - The server will automatically open your browser
   - Or manually navigate to `http://localhost:8000`

3. **Start quizzing**:
   - Choose between Full Series or Weekly Series
   - Answer questions one by one
   - Review your results and retake as needed

## File Structure

```
nptel/
├── index.html          # Main HTML file
├── styles.css          # CSS with animations and mobile styling
├── script.js           # JavaScript for quiz functionality
├── quiz_data.json      # Generated quiz questions and answers
├── server.py           # Local HTTP server
├── pdf_extractor.py    # PDF text extraction script
├── improved_pdf_extractor.py  # Enhanced quiz data generator
└── README.md           # This file
```

## Quiz Content

The quiz contains 120 questions covering Advanced Data Structures topics including:

- Rumor Mongering Protocols
- FLP (Fischer-Lynch-Paterson) Results
- Consensus Algorithms
- Freenet Design
- Pastry Protocol
- BitTorrent Protocol
- Chord Protocol
- CAN (Content Addressable Network)
- And many more...

## Technical Details

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Glassmorphism design with CSS backdrop-filter
- **Animations**: CSS keyframes and transitions
- **Mobile**: Touch-friendly interface with swipe gestures
- **Data**: JSON-based question storage
- **Server**: Python HTTP server for local development

## Customization

To modify quiz content:
1. Edit `quiz_data.json` to add/remove questions
2. Update question structure in `improved_pdf_extractor.py`
3. Regenerate data by running the extractor script

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

For development and testing:
```bash
# Install dependencies
pip install pdfplumber

# Extract questions from PDF (if needed)
python3 improved_pdf_extractor.py

# Start development server
python3 server.py
```

## License

This project is created for educational purposes based on NPTEL content.
